import AppLayout from '@/layouts/app-layout';
import {
    DeleteOutlined,
    EditOutlined,
    EyeOutlined,
    GlobalOutlined,
    PlusOutlined,
} from '@ant-design/icons';
import { router } from '@inertiajs/react';
import { Button, message, Popconfirm, Space, Table, Tag, Tooltip } from 'antd';
import { route } from 'ziggy-js';

export default function BlogPostIndex({ blogPosts }) {
    const handleDelete = (slug) => {
        router.delete(route('admin.blog-posts.destroy', slug), {
            preserveScroll: true,
            onSuccess: () => {
                message.success('Blog post berhasil dihapus!');
            },
            onError: () => message.error('Gagal menghapus blog post'),
        });
    };

    const handleTogglePublish = (slug) => {
        router.patch(
            route('admin.blog-posts.toggle-publish', slug),
            {},
            {
                onSuccess: () =>
                    message.success('Status publikasi berhasil diubah!'),
                onError: () => message.error('Gagal mengubah status publikasi'),
            },
        );
    };

    const columns = [
        {
            title: 'Judul',
            dataIndex: 'title',
            key: 'title',
            render: (text, record) => (
                <div>
                    <div style={{ fontWeight: 500 }}>{text}</div>
                    <small style={{ color: '#999' }}>
                        Project: {record.project.title}
                    </small>
                </div>
            ),
        },
        {
            title: 'Status',
            dataIndex: 'is_published',
            key: 'is_published',
            width: 120,
            render: (isPublished, record) => (
                <Popconfirm
                    title="Ubah status publikasi?"
                    description={
                        isPublished
                            ? 'Blog post akan di-unpublish dan tidak bisa diakses publik'
                            : 'Blog post akan dipublish dan bisa diakses publik'
                    }
                    onConfirm={() => handleTogglePublish(record.slug)}
                    okText="Ya"
                    cancelText="Tidak"
                >
                    <Tag
                        color={isPublished ? 'green' : 'orange'}
                        style={{ cursor: 'pointer' }}
                    >
                        {isPublished ? '✓ Published' : 'Draft'}
                    </Tag>
                </Popconfirm>
            ),
        },
        {
            title: 'Tanggal Publikasi',
            dataIndex: 'published_at',
            key: 'published_at',
            width: 180,
            render: (date) => date || <span style={{ color: '#999' }}>-</span>,
        },
        {
            title: 'Dibuat',
            dataIndex: 'created_at',
            key: 'created_at',
            width: 180,
        },
        {
            title: 'Aksi',
            key: 'actions',
            width: 200,
            render: (_, record) => (
                <Space size="small">
                    {/* ✅ IMPROVED: Admin Preview Button */}
                    <Tooltip title="Preview (Admin)">
                        <Button
                            type="text"
                            icon={<EyeOutlined />}
                            onClick={() =>
                                router.visit(
                                    route('admin.blog-posts.show', record.slug),
                                )
                            }
                        />
                    </Tooltip>

                    {/* ✅ NEW: Public View Button (hanya untuk yang published) */}
                    {record.is_published && (
                        <Tooltip title="Lihat Live Version">
                            <Button
                                type="text"
                                icon={<GlobalOutlined />}
                                onClick={() => {
                                    window.open(
                                        route('projects.blog-posts.show', {
                                            project: record.project.slug,
                                            blogPost: record.slug,
                                        }),
                                        '_blank',
                                    );
                                }}
                                style={{ color: '#52c41a' }}
                            />
                        </Tooltip>
                    )}

                    {/* Edit Button */}
                    <Tooltip title="Edit">
                        <Button
                            type="text"
                            icon={<EditOutlined />}
                            onClick={() =>
                                router.visit(
                                    route('admin.blog-posts.edit', record.slug),
                                )
                            }
                        />
                    </Tooltip>

                    {/* Delete Button */}
                    <Popconfirm
                        title="Yakin ingin menghapus?"
                        description="Blog post akan dihapus permanen!"
                        onConfirm={() => handleDelete(record.slug)}
                        okText="Hapus"
                        cancelText="Batal"
                        okButtonProps={{ danger: true }}
                    >
                        <Tooltip title="Hapus">
                            <Button
                                type="text"
                                danger
                                icon={<DeleteOutlined />}
                            />
                        </Tooltip>
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    return (
        <AppLayout>
            <div>
                {/* ✅ IMPROVED: Header dengan stats */}
                <div
                    style={{
                        marginBottom: 24,
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                    }}
                >
                    <div>
                        <h2 style={{ margin: 0, marginBottom: 8 }}>
                            📝 Manajemen Blog Posts
                        </h2>
                        <div style={{ color: '#999', fontSize: '14px' }}>
                            Total: {blogPosts.total} post
                            {blogPosts.total > 1 ? 's' : ''} • Published:{' '}
                            {
                                blogPosts.data.filter(
                                    (post) => post.is_published,
                                ).length
                            }{' '}
                            • Draft:{' '}
                            {
                                blogPosts.data.filter(
                                    (post) => !post.is_published,
                                ).length
                            }
                        </div>
                    </div>
                    <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={() =>
                            router.visit(route('admin.blog-posts.create'))
                        }
                        size="large"
                    >
                        Buat Blog Post Baru
                    </Button>
                </div>

                {/* ✅ IMPROVED: Table dengan styling lebih baik */}
                <Table
                    columns={columns}
                    dataSource={blogPosts.data}
                    rowKey="id"
                    pagination={{
                        current: blogPosts.current_page,
                        pageSize: blogPosts.per_page,
                        total: blogPosts.total,
                        showSizeChanger: true,
                        showTotal: (total, range) =>
                            `${range[0]}-${range[1]} dari ${total} posts`,
                        onChange: (page) => {
                            router.get(
                                route('admin.blog-posts.index', { page }),
                            );
                        },
                    }}
                    style={{
                        background: 'white',
                        borderRadius: '8px',
                        overflow: 'hidden',
                    }}
                />
            </div>
        </AppLayout>
    );
}
