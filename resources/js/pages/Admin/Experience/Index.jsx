import {
    CheckCircleOutlined,
    ClockCircleOutlined,
    DeleteOutlined,
    EditOutlined,
    EyeOutlined,
    HolderOutlined,
    PlusOutlined,
    StarFilled,
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
import { Link, router } from '@inertiajs/react';
import {
    Badge,
    Button,
    Image,
    message,
    Popconfirm,
    Space,
    Tag,
    Tooltip,
    Typography,
} from 'antd';
import { useState } from 'react';
import AppLayout from '../../../layouts/app-layout';

const { Title, Text } = Typography;

/**
 * Sortable Row Component
 */
function SortableRow({ id, experience, onEdit, onDelete, onView }) {
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

    const getEmploymentColor = (type) => {
        const colors = {
            'full-time': 'green',
            'part-time': 'blue',
            contract: 'cyan',
            internship: 'purple',
            freelance: 'orange',
        };
        return colors[type] || 'default';
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

                {/* Company Logo */}
                <div className="flex-shrink-0">
                    {experience.company_logo ? (
                        <Image
                            src={`/storage/${experience.company_logo}`}
                            alt={experience.company_name}
                            width={48}
                            height={48}
                            style={{
                                objectFit: 'contain',
                                borderRadius: 8,
                            }}
                            preview={false}
                        />
                    ) : (
                        <div
                            style={{
                                width: 48,
                                height: 48,
                                borderRadius: 8,
                                background: '#1890ff',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: 'white',
                                fontWeight: 'bold',
                                fontSize: 20,
                            }}
                        >
                            {experience.company_name.charAt(0)}
                        </div>
                    )}
                </div>

                {/* Company Info */}
                <div className="flex-1">
                    <Text strong style={{ fontSize: 16 }}>
                        {experience.company_name}
                    </Text>
                    <br />
                    <Text type="secondary">{experience.position}</Text>
                </div>

                {/* Employment Type */}
                <div className="flex-shrink-0">
                    <Tag color={getEmploymentColor(experience.employment_type)}>
                        {experience.employment_type_label}
                    </Tag>
                </div>

                {/* Duration */}
                <div className="flex-shrink-0" style={{ minWidth: 150 }}>
                    <Text>{experience.formatted_duration}</Text>
                    {experience.is_current && (
                        <Badge
                            status="processing"
                            text="Current"
                            style={{ marginLeft: 8 }}
                        />
                    )}
                </div>

                {/* Status Badges */}
                <div className="flex-shrink-0">
                    <Space direction="vertical" size={4}>
                        {experience.is_featured && (
                            <Tag icon={<StarFilled />} color="gold">
                                Featured
                            </Tag>
                        )}
                        {experience.is_published ? (
                            <Tag icon={<CheckCircleOutlined />} color="success">
                                Published
                            </Tag>
                        ) : (
                            <Tag icon={<ClockCircleOutlined />} color="default">
                                Draft
                            </Tag>
                        )}
                    </Space>
                </div>

                {/* Display Order */}
                <div className="flex-shrink-0" style={{ minWidth: 40 }}>
                    <Text
                        strong
                        style={{
                            fontSize: 16,
                            color: '#1890ff',
                        }}
                    >
                        #{experience.display_order}
                    </Text>
                </div>

                {/* Actions */}
                <div className="flex-shrink-0">
                    <Space>
                        <Tooltip title="View on Portfolio">
                            <Button
                                type="text"
                                icon={<EyeOutlined />}
                                onClick={() => onView(experience.slug)}
                                size="small"
                            />
                        </Tooltip>
                        <Tooltip title="Edit">
                            <Button
                                type="primary"
                                icon={<EditOutlined />}
                                onClick={() => onEdit(experience.id)}
                                size="small"
                            />
                        </Tooltip>
                        <Popconfirm
                            title="Delete Experience"
                            description="Are you sure you want to delete this experience?"
                            onConfirm={() => onDelete(experience.id)}
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

/**
 * Main Index Component with Drag & Drop
 */
export default function ExperienceIndex({ experiences }) {
    const [items, setItems] = useState(experiences.data);
    const [loading, setLoading] = useState(false);
    const [reordering, setReordering] = useState(false);

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        }),
    );

    const handleDragEnd = (event) => {
        const { active, over } = event;

        if (active.id !== over.id) {
            setItems((items) => {
                const oldIndex = items.findIndex(
                    (item) => item.id === active.id,
                );
                const newIndex = items.findIndex((item) => item.id === over.id);

                const reordered = arrayMove(items, oldIndex, newIndex);

                // Update display_order based on new position
                const updatedItems = reordered.map((item, index) => ({
                    ...item,
                    display_order: index,
                }));

                // Save to backend
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

        try {
            await router.post(
                route('admin.experience.reorder'),
                { items: orderData },
                {
                    preserveScroll: true,
                    onSuccess: () => {
                        message.success('Order updated successfully!');
                    },
                    onError: () => {
                        message.error(
                            'Failed to update order. Please try again.',
                        );
                    },
                    onFinish: () => {
                        setReordering(false);
                    },
                },
            );
        } catch (error) {
            console.error('Reorder error:', error);
            message.error('An error occurred while reordering.');
            setReordering(false);
        }
    };

    const handleDelete = (id) => {
        setLoading(true);
        router.delete(route('admin.experience.destroy', id), {
            onSuccess: () => {
                message.success('Experience deleted successfully!');
                setItems(items.filter((item) => item.id !== id));
            },
            onError: () => {
                message.error('Failed to delete experience.');
            },
            onFinish: () => {
                setLoading(false);
            },
        });
    };

    const handleEdit = (id) => {
        router.visit(route('admin.experience.edit', id));
    };

    const handleView = (slug) => {
        window.open(route('portfolio.experience.show', slug), '_blank');
    };

    return (
        <AppLayout
            header={
                <div
                    style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                    }}
                >
                    <div>
                        <Title level={2} style={{ margin: 0 }}>
                            Experience Management
                        </Title>
                        <Text type="secondary">
                            Drag & drop to reorder • {items.length} total
                            experiences
                        </Text>
                    </div>
                    <Link href={route('admin.experience.create')}>
                        <Button
                            type="primary"
                            icon={<PlusOutlined />}
                            size="large"
                        >
                            Add New Experience
                        </Button>
                    </Link>
                </div>
            }
        >
            {reordering && (
                <div
                    style={{
                        padding: 16,
                        background: '#e6f7ff',
                        border: '1px solid #91d5ff',
                        borderRadius: 8,
                        marginBottom: 16,
                    }}
                >
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
                        {items.map((experience) => (
                            <SortableRow
                                key={experience.id}
                                id={experience.id}
                                experience={experience}
                                onEdit={handleEdit}
                                onDelete={handleDelete}
                                onView={handleView}
                            />
                        ))}
                    </div>
                </SortableContext>
            </DndContext>

            {items.length === 0 && (
                <div
                    style={{
                        textAlign: 'center',
                        padding: 64,
                        color: '#999',
                    }}
                >
                    <Text type="secondary">
                        No experiences yet. Click "Add New Experience" to get
                        started.
                    </Text>
                </div>
            )}
        </AppLayout>
    );
}
