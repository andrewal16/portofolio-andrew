import { DeleteOutlined, EditOutlined, FileImageOutlined, PlusOutlined } from '@ant-design/icons';
import { router, usePage } from '@inertiajs/react';
import { Button, Image, Popconfirm, Space, Table, Tag, message } from 'antd';
import { route } from 'ziggy-js';
import AppLayout from '../../../layouts/app-layout';

function Index() {
    const { projects, flash } = usePage().props;

    // Show flash message (success/error)
    if (flash?.success) {
        message.success(flash.success);
    }

    console.log("Projects Data:", JSON.stringify(projects, null, 2));

    const columns = [
        {
            title: 'Title',
            dataIndex: 'title',
            key: 'title',
            render: (text, record) => (
                <div>
                    <div className="font-semibold">{text}</div>
                    <div className="text-xs text-gray-500">{record.slug}</div>
                </div>
            ),
        },
        {
            title: 'Thumbnail',
            dataIndex: 'thumbnail_url',
            key: 'thumbnail_url',
            width: 100,
            render: (url) =>
                url ? (
                    <Image
                        src={url}
                        alt="Thumbnail"
                        width={60}
                        height={60}
                        style={{ objectFit: 'cover', borderRadius: 4 }}
                        preview={{
                            mask: 'Preview',
                        }}
                    />
                ) : (
                    <div
                        style={{
                            width: 60,
                            height: 60,
                            background: '#f0f0f0',
                            borderRadius: 4,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}
                    >
                        <FileImageOutlined
                            style={{ fontSize: 24, color: '#bbb' }}
                        />
                    </div>
                ),
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            render: (status) => {
                const colors = {
                    ongoing: 'blue',
                    completed: 'green',
                    upcoming: 'orange',
                    paused: 'red',
                };
                return (
                    <Tag color={colors[status] || 'default'}>
                        {status.toUpperCase()}
                    </Tag>
                );
            },
        },
        {
            title: 'Started At',
            dataIndex: 'started_at',
            key: 'started_at',
            render: (date) => new Date(date).toLocaleDateString('id-ID'),
        },
        {
            title: 'Finished At',
            dataIndex: 'finished_at',
            key: 'finished_at',
            render: (date) =>
                date ? new Date(date).toLocaleDateString('id-ID') : '-',
        },
        {
            title: 'Action',
            key: 'action',
            render: (_, record) => (
                <Space size="small">
                    <Button
                        type="primary"
                        icon={<EditOutlined />}
                        size="small"
                        onClick={() =>
                            router.visit(
                                route('admin.project.edit', record.slug),
                            )
                        }
                    >
                        Edit
                    </Button>
                    <Popconfirm
                        title="Hapus project ini?"
                        description="Data yang dihapus tidak dapat dikembalikan."
                        onConfirm={() => handleDelete(record.slug)}
                        okText="Ya, Hapus"
                        cancelText="Batal"
                        okButtonProps={{ danger: true }}
                    >
                        <Button danger icon={<DeleteOutlined />} size="small">
                            Delete
                        </Button>
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    const handleDelete = (slug) => {
        router.delete(route('admin.project.destroy', slug), {
            preserveScroll: true,
            onSuccess: () => {
                message.success('Project berhasil dihapus!');
            },
        });
    };

    return (
        <AppLayout header="Master Project List Page">
            <div className="!flex !justify-end">
                <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={() => router.visit(route('admin.project.create'))}
                    style={{ marginBottom: 16 }}
                >
                    Add Project
                </Button>
            </div>
            <Table
                dataSource={projects.data}
                columns={columns}
                rowKey="id"
                pagination={{
                    current: projects.current_page,
                    pageSize: projects.per_page,
                    total: projects.total,
                    onChange: (page) => {
                        router.get(
                            route('admin.project.index', { page }),
                            {},
                            { preserveState: true },
                        );
                    },
                }}
            />
        </AppLayout>
    );
}

export default Index;
