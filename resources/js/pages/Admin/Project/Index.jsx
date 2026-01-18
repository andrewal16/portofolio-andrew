import {
    DeleteOutlined,
    EditOutlined,
    EyeOutlined,
    FileImageOutlined,
    HolderOutlined,
    PlusOutlined,
    RocketOutlined,
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
    Select,
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
function SortableRow({ id, project, onEdit, onDelete, onView }) {
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
        cursor: isDragging ? 'grabbing' : 'default',
    };

    const statusColors = {
        ongoing: 'blue',
        completed: 'green',
        upcoming: 'orange',
        paused: 'red',
    };

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
                    className="flex cursor-grab items-center justify-center text-gray-400 transition-colors hover:text-gray-600 active:cursor-grabbing"
                >
                    <HolderOutlined style={{ fontSize: 20 }} />
                </div>

                {/* Thumbnail */}
                <div className="flex-shrink-0">
                    {project.thumbnail_url ? (
                        <Image
                            src={project.thumbnail_url}
                            alt={project.title}
                            width={64}
                            height={48}
                            style={{ objectFit: 'cover', borderRadius: 6 }}
                            preview={false}
                        />
                    ) : (
                        <div
                            style={{
                                width: 64,
                                height: 48,
                                borderRadius: 6,
                                background: '#f0f0f0',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}
                        >
                            <FileImageOutlined
                                style={{ fontSize: 20, color: '#bbb' }}
                            />
                        </div>
                    )}
                </div>

                {/* Project Info */}
                <div className="min-w-0 flex-1">
                    <Text
                        strong
                        style={{ fontSize: 15 }}
                        className="block truncate"
                    >
                        {project.title}
                    </Text>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                        {project.slug}
                    </Text>
                </div>

                {/* Type Badge */}
                <div className="flex-shrink-0" style={{ minWidth: 100 }}>
                    {project.type ? (
                        <Tag color="purple">{project.type}</Tag>
                    ) : (
                        <Tag color="default">No Type</Tag>
                    )}
                </div>

                {/* Status */}
                <div className="flex-shrink-0">
                    <Tag color={statusColors[project.status] || 'default'}>
                        {project.status?.toUpperCase()}
                    </Tag>
                </div>

                {/* Display Order */}
                <div className="flex-shrink-0" style={{ minWidth: 40 }}>
                    <Text strong style={{ fontSize: 14, color: '#1890ff' }}>
                        #{project.display_order}
                    </Text>
                </div>

                {/* Date */}
                <div className="flex-shrink-0" style={{ minWidth: 90 }}>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                        {project.started_at || '-'}
                    </Text>
                </div>

                {/* Actions */}
                <div className="flex-shrink-0">
                    <Space>
                        <Tooltip title="View on Portfolio">
                            <Button
                                type="text"
                                icon={<EyeOutlined />}
                                onClick={() => onView(project.slug)}
                                size="small"
                            />
                        </Tooltip>
                        <Tooltip title="Edit">
                            <Button
                                type="primary"
                                icon={<EditOutlined />}
                                onClick={() => onEdit(project.slug)}
                                size="small"
                            />
                        </Tooltip>
                        <Popconfirm
                            title="Delete Project"
                            description="Are you sure? This cannot be undone."
                            onConfirm={() => onDelete(project.slug)}
                            okText="Yes, Delete"
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
export default function ProjectIndex() {
    const { projects, availableTypes, flash } = usePage().props;
    const [items, setItems] = useState(projects.data || []);
    const [reordering, setReordering] = useState(false);
    const [filterType, setFilterType] = useState('all');

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        }),
    );

    useEffect(() => {
        if (flash?.success) {
            message.success(flash.success);
        }
    }, [flash]);

    useEffect(() => {
        setItems(projects.data || []);
    }, [projects.data]);

    const handleDragEnd = (event) => {
        const { active, over } = event;
        if (active.id !== over.id) {
            setItems((items) => {
                const oldIndex = items.findIndex(
                    (item) => item.id === active.id,
                );
                const newIndex = items.findIndex((item) => item.id === over.id);
                const reordered = arrayMove(items, oldIndex, newIndex);

                const updatedItems = reordered.map((item, index) => ({
                    ...item,
                    display_order: index,
                }));

                saveNewOrder(updatedItems);
                return updatedItems;
            });
        }
    };

    const saveNewOrder = async (reorderedItems) => {
        setReordering(true);
        const orderData = reorderedItems.map((item) => ({
            id: item.id,
            display_order: item.display_order,
        }));

        router.post(
            route('admin.project.reorder'),
            { items: orderData },
            {
                preserveScroll: true,
                onSuccess: () => message.success('Order updated!'),
                onError: () => message.error('Failed to update order'),
                onFinish: () => setReordering(false),
            },
        );
    };

    const handleDelete = (slug) => {
        router.delete(route('admin.project.destroy', slug), {
            preserveScroll: true,
            onSuccess: () => {
                message.success('Project deleted!');
                setItems(items.filter((item) => item.slug !== slug));
            },
        });
    };

    const handleEdit = (slug) =>
        router.visit(route('admin.project.edit', slug));
    const handleView = (slug) =>
        window.open(route('portfolio.project.show', slug), '_blank');

    const handleFilterChange = (value) => {
        setFilterType(value);
        router.get(
            route('admin.project.index'),
            { type: value === 'all' ? null : value },
            { preserveState: true },
        );
    };

    return (
        <AppLayout
            header={
                <div className="flex items-center justify-between">
                    <div>
                        <Title level={2} style={{ margin: 0 }}>
                            Project Management
                        </Title>
                        <Text type="secondary">
                            Drag & drop to reorder • {items.length} projects
                        </Text>
                    </div>
                    <Space>
                        <Select
                            value={filterType}
                            onChange={handleFilterChange}
                            style={{ width: 150 }}
                            options={[
                                { value: 'all', label: 'All Types' },
                                ...availableTypes.map((t) => ({
                                    value: t,
                                    label: t,
                                })),
                            ]}
                        />
                        <Link href={route('admin.project.create')}>
                            <Button
                                type="primary"
                                icon={<PlusOutlined />}
                                size="large"
                            >
                                Add New Project
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
                    items={items.map((item) => item.id)}
                    strategy={verticalListSortingStrategy}
                >
                    <div>
                        {items.map((project) => (
                            <SortableRow
                                key={project.id}
                                id={project.id}
                                project={project}
                                onEdit={handleEdit}
                                onDelete={handleDelete}
                                onView={handleView}
                            />
                        ))}
                    </div>
                </SortableContext>
            </DndContext>

            {items.length === 0 && (
                <div className="py-16 text-center text-gray-400">
                    <RocketOutlined
                        style={{ fontSize: 48, marginBottom: 16 }}
                    />
                    <br />
                    <Text type="secondary">
                        No projects yet. Create your first one!
                    </Text>
                </div>
            )}

            {/* Pagination */}
            {projects.last_page > 1 && (
                <div className="mt-6 flex justify-center">
                    <Space>
                        {Array.from({ length: projects.last_page }, (_, i) => (
                            <Button
                                key={i + 1}
                                type={
                                    projects.current_page === i + 1
                                        ? 'primary'
                                        : 'default'
                                }
                                onClick={() =>
                                    router.get(
                                        route('admin.project.index', {
                                            page: i + 1,
                                        }),
                                    )
                                }
                            >
                                {i + 1}
                            </Button>
                        ))}
                    </Space>
                </div>
            )}
        </AppLayout>
    );
}
