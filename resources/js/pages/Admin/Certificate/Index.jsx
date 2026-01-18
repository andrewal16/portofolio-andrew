import {
    BookOutlined,
    DeleteOutlined,
    EditOutlined,
    FileImageOutlined,
    FilePdfOutlined,
    HolderOutlined,
    LinkOutlined,
    PlusOutlined,
    SafetyCertificateOutlined,
    TrophyOutlined,
} from '@ant-design/icons';
import {
    closestCenter,
    DndContext,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    useSortable,
    verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Link, router, usePage } from '@inertiajs/react';
import {
    Button,
    Image,
    message,
    Popconfirm,
    Segmented,
    Space,
    Tag,
    Tooltip,
    Typography,
} from 'antd';
import { useEffect, useState } from 'react';
import { route } from 'ziggy-js';
import AppLayout from '../../../layouts/app-layout';

const { Title, Text } = Typography;

// ✅ Sortable Row Component
function SortableRow({ id, certificate, onEdit, onDelete }) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    };

    const isPdf = certificate.file_type === 'pdf';

    return (
        <div
            ref={setNodeRef}
            style={style}
            className="mb-3 overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm transition-all hover:shadow-md"
        >
            <div className="flex items-center gap-4 p-4">
                {/* Drag Handle */}
                <div
                    {...attributes}
                    {...listeners}
                    className="flex cursor-grab items-center justify-center text-gray-400 hover:text-gray-600 active:cursor-grabbing"
                >
                    <HolderOutlined style={{ fontSize: 20 }} />
                </div>

                {/* Thumbnail/Icon */}
                <div className="flex-shrink-0">
                    {certificate.image_url ? (
                        isPdf ? (
                            <div className="flex h-12 w-16 items-center justify-center rounded bg-red-50">
                                <FilePdfOutlined className="text-2xl text-red-500" />
                            </div>
                        ) : (
                            <Image
                                src={certificate.image_url}
                                alt={certificate.name}
                                width={64}
                                height={48}
                                style={{ objectFit: 'cover', borderRadius: 6 }}
                                preview={{ mask: 'View' }}
                            />
                        )
                    ) : (
                        <div className="flex h-12 w-16 items-center justify-center rounded bg-gray-100">
                            <FileImageOutlined className="text-xl text-gray-400" />
                        </div>
                    )}
                </div>

                {/* Certificate Info */}
                <div className="min-w-0 flex-1">
                    <Text
                        strong
                        className="block truncate"
                        style={{ fontSize: 14 }}
                    >
                        {certificate.name}
                    </Text>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                        <SafetyCertificateOutlined className="mr-1" />
                        {certificate.issuer}
                    </Text>
                </div>

                {/* Category Badge */}
                <div className="flex-shrink-0">
                    <Tag
                        icon={
                            certificate.category === 'competition' ? (
                                <TrophyOutlined />
                            ) : (
                                <BookOutlined />
                            )
                        }
                        color={certificate.category_color}
                    >
                        {certificate.category_label}
                    </Tag>
                </div>

                {/* Tags */}
                <div className="flex-shrink-0" style={{ maxWidth: 200 }}>
                    <Space wrap size={[0, 4]}>
                        {certificate.tags?.slice(0, 2).map((tag) => (
                            <Tag
                                key={tag.id}
                                color={tag.color}
                                style={{ fontSize: 10 }}
                            >
                                {tag.name}
                            </Tag>
                        ))}
                        {certificate.tags?.length > 2 && (
                            <Tag style={{ fontSize: 10 }}>
                                +{certificate.tags.length - 2}
                            </Tag>
                        )}
                    </Space>
                </div>

                {/* Date */}
                <div className="flex-shrink-0" style={{ minWidth: 80 }}>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                        {certificate.issued_at}
                    </Text>
                </div>

                {/* Display Order */}
                <div className="flex-shrink-0" style={{ minWidth: 40 }}>
                    <Text strong style={{ fontSize: 14, color: '#1890ff' }}>
                        #{certificate.display_order}
                    </Text>
                </div>

                {/* Actions */}
                <div className="flex-shrink-0">
                    <Space>
                        {certificate.credential_url && (
                            <Tooltip title="View Credential">
                                <Button
                                    type="text"
                                    icon={<LinkOutlined />}
                                    href={certificate.credential_url}
                                    target="_blank"
                                    size="small"
                                />
                            </Tooltip>
                        )}
                        <Tooltip title="Edit">
                            <Button
                                type="primary"
                                icon={<EditOutlined />}
                                onClick={() => onEdit(certificate.id)}
                                size="small"
                            />
                        </Tooltip>
                        <Popconfirm
                            title="Delete Certificate"
                            description="This action cannot be undone."
                            onConfirm={() => onDelete(certificate.id)}
                            okText="Delete"
                            cancelText="Cancel"
                            okButtonProps={{ danger: true }}
                        >
                            <Tooltip title="Delete">
                                <Button
                                    type="text"
                                    danger
                                    icon={<DeleteOutlined />}
                                    size="small"
                                />
                            </Tooltip>
                        </Popconfirm>
                    </Space>
                </div>
            </div>
        </div>
    );
}

// ✅ Main Index Component
export default function CertificateIndex() {
    const { certificates, categoryOptions, filters, flash } = usePage().props;
    const [items, setItems] = useState(certificates.data || []);
    const [reordering, setReordering] = useState(false);
    const [activeCategory, setActiveCategory] = useState(
        filters?.category || 'all',
    );

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        }),
    );

    useEffect(() => {
        if (flash?.success) message.success(flash.success);
    }, [flash]);

    useEffect(() => {
        setItems(certificates.data || []);
    }, [certificates.data]);

    const handleDragEnd = (event) => {
        const { active, over } = event;
        if (active.id !== over.id) {
            setItems((items) => {
                const oldIndex = items.findIndex((i) => i.id === active.id);
                const newIndex = items.findIndex((i) => i.id === over.id);
                const reordered = arrayMove(items, oldIndex, newIndex);

                const updated = reordered.map((item, idx) => ({
                    ...item,
                    display_order: idx,
                }));

                saveNewOrder(updated);
                return updated;
            });
        }
    };

    const saveNewOrder = (reorderedItems) => {
        setReordering(true);
        const orderData = reorderedItems.map((item) => ({
            id: item.id,
            display_order: item.display_order,
        }));

        router.post(
            route('admin.certificate.reorder'),
            { items: orderData },
            {
                preserveScroll: true,
                onSuccess: () => message.success('Order updated!'),
                onError: () => message.error('Failed to update order'),
                onFinish: () => setReordering(false),
            },
        );
    };

    const handleDelete = (id) => {
        router.delete(route('admin.certificate.destroy', id), {
            preserveScroll: true,
            onSuccess: () => {
                message.success('Certificate deleted!');
                setItems(items.filter((i) => i.id !== id));
            },
        });
    };

    const handleEdit = (id) =>
        router.visit(route('admin.certificate.edit', id));

    const handleCategoryChange = (value) => {
        setActiveCategory(value);
        router.get(
            route('admin.certificate.index'),
            { category: value === 'all' ? null : value },
            { preserveState: true },
        );
    };

    // Category tabs options
    const categoryTabs = [
        { label: 'All', value: 'all', icon: <SafetyCertificateOutlined /> },
        { label: 'Learning', value: 'learning', icon: <BookOutlined /> },
        {
            label: 'Competition',
            value: 'competition',
            icon: <TrophyOutlined />,
        },
    ];

    return (
        <AppLayout
            header={
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                        <Title level={2} style={{ margin: 0 }}>
                            Certificate Management
                        </Title>
                        <Text type="secondary">
                            Drag & drop to reorder • {certificates.total}{' '}
                            certificates
                        </Text>
                    </div>
                    <Space>
                        <Segmented
                            value={activeCategory}
                            onChange={handleCategoryChange}
                            options={categoryTabs.map((tab) => ({
                                label: (
                                    <span className="flex items-center gap-1">
                                        {tab.icon} {tab.label}
                                    </span>
                                ),
                                value: tab.value,
                            }))}
                        />
                        <Link href={route('admin.certificate.create')}>
                            <Button
                                type="primary"
                                icon={<PlusOutlined />}
                                size="large"
                            >
                                Add Certificate
                            </Button>
                        </Link>
                    </Space>
                </div>
            }
        >
            {reordering && (
                <div className="mb-4 rounded-lg border border-blue-200 bg-blue-50 p-4">
                    <Text>🔄 Saving new order...</Text>
                </div>
            )}

            <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
            >
                <SortableContext
                    items={items.map((i) => i.id)}
                    strategy={verticalListSortingStrategy}
                >
                    <div>
                        {items.map((certificate) => (
                            <SortableRow
                                key={certificate.id}
                                id={certificate.id}
                                certificate={certificate}
                                onEdit={handleEdit}
                                onDelete={handleDelete}
                            />
                        ))}
                    </div>
                </SortableContext>
            </DndContext>

            {items.length === 0 && (
                <div className="py-16 text-center text-gray-400">
                    <SafetyCertificateOutlined
                        style={{ fontSize: 48, marginBottom: 16 }}
                    />
                    <br />
                    <Text type="secondary">No certificates found.</Text>
                </div>
            )}

            {/* Pagination */}
            {certificates.last_page > 1 && (
                <div className="mt-6 flex justify-center">
                    <Space>
                        {Array.from(
                            { length: certificates.last_page },
                            (_, i) => (
                                <Button
                                    key={i + 1}
                                    type={
                                        certificates.current_page === i + 1
                                            ? 'primary'
                                            : 'default'
                                    }
                                    onClick={() =>
                                        router.get(
                                            route('admin.certificate.index', {
                                                page: i + 1,
                                                category:
                                                    activeCategory === 'all'
                                                        ? null
                                                        : activeCategory,
                                            }),
                                        )
                                    }
                                >
                                    {i + 1}
                                </Button>
                            ),
                        )}
                    </Space>
                </div>
            )}
        </AppLayout>
    );
}
