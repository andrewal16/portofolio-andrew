import {
    DeleteOutlined,
    EditOutlined,
    FileImageOutlined,
    FilePdfOutlined,
    LinkOutlined,
    PlusOutlined,
    SafetyCertificateOutlined,
} from '@ant-design/icons';
import { router, usePage } from '@inertiajs/react';
import {
    Badge,
    Button,
    Card,
    Image,
    Popconfirm,
    Space,
    Table,
    Tag,
    Tooltip,
    Typography,
    message,
} from 'antd';
import { useEffect } from 'react';
import { route } from 'ziggy-js';
import AppLayout from '../../../layouts/app-layout';

const { Text, Link } = Typography;

function Index() {
    const { certificates, flash } = usePage().props;

    useEffect(() => {
        if (flash?.success) {
            message.success(flash.success);
        }
    }, [flash]);

    // 🔥 Helper function untuk render preview berdasarkan file type
    const renderFilePreview = (url, fileType) => {
        if (!url) {
            return (
                <div
                    style={{
                        width: 80,
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
            );
        }

        // 🔥 Kalau PDF, tampilkan icon PDF dengan badge
        if (fileType === 'pdf') {
            return (
                <Tooltip title="Click to view PDF">
                    <a
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ textDecoration: 'none' }}
                    >
                        <Badge.Ribbon text="PDF" color="red">
                            <div
                                style={{
                                    width: 80,
                                    height: 60,
                                    background:
                                        'linear-gradient(135deg, #ff6b6b 0%, #ee5a6f 100%)',
                                    borderRadius: 4,
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    cursor: 'pointer',
                                    transition: 'all 0.3s ease',
                                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.transform =
                                        'scale(1.05)';
                                    e.currentTarget.style.boxShadow =
                                        '0 4px 8px rgba(0,0,0,0.2)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.transform =
                                        'scale(1)';
                                    e.currentTarget.style.boxShadow =
                                        '0 2px 4px rgba(0,0,0,0.1)';
                                }}
                            >
                                <FilePdfOutlined
                                    style={{
                                        fontSize: 28,
                                        color: '#fff',
                                        marginBottom: 4,
                                    }}
                                />
                                <Text
                                    style={{
                                        fontSize: 10,
                                        color: '#fff',
                                        fontWeight: 600,
                                    }}
                                >
                                    VIEW
                                </Text>
                            </div>
                        </Badge.Ribbon>
                    </a>
                </Tooltip>
            );
        }

        // 🔥 Kalau image, tampilkan preview normal
        return (
            <Badge.Ribbon text="IMAGE" color="blue">
                <Image
                    src={url}
                    alt="Certificate"
                    width={80}
                    height={60}
                    style={{
                        objectFit: 'cover',
                        borderRadius: 4,
                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                    }}
                    preview={{
                        mask: 'Preview',
                    }}
                />
            </Badge.Ribbon>
        );
    };

    const columns = [
        {
            title: 'File',
            dataIndex: 'image_url',
            key: 'image_url',
            width: 120,
            render: (url, record) => renderFilePreview(url, record.file_type),
        },
        {
            title: 'Certificate Info',
            key: 'info',
            render: (_, record) => (
                <div>
                    <div
                        style={{
                            fontWeight: 600,
                            fontSize: 14,
                            marginBottom: 4,
                        }}
                    >
                        {record.name}
                    </div>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                        <SafetyCertificateOutlined style={{ marginRight: 4 }} />
                        {record.issuer}
                    </Text>
                    {record.credential_id && (
                        <div>
                            <Text type="secondary" style={{ fontSize: 12 }}>
                                ID: {record.credential_id}
                            </Text>
                        </div>
                    )}
                </div>
            ),
        },
        {
            title: 'Issued Date',
            dataIndex: 'issued_at',
            key: 'issued_at',
            width: 120,
            sorter: (a, b) => new Date(a.issued_at) - new Date(b.issued_at),
            render: (date, record) => (
                <div>
                    <div style={{ fontWeight: 500 }}>
                        {new Date(date).toLocaleDateString('id-ID', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                        })}
                    </div>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                        {record.issued_year}
                    </Text>
                </div>
            ),
        },
        {
            title: 'Tags',
            dataIndex: 'tags',
            key: 'tags',
            render: (tags) => (
                <Space wrap size={[0, 4]}>
                    {tags && tags.length > 0 ? (
                        tags.map((tag) => (
                            <Tag key={tag.id} color={tag.color}>
                                {tag.name}
                            </Tag>
                        ))
                    ) : (
                        <Text type="secondary" style={{ fontSize: 12 }}>
                            No tags
                        </Text>
                    )}
                </Space>
            ),
        },
        {
            title: 'Credential',
            dataIndex: 'credential_url',
            key: 'credential_url',
            width: 100,
            align: 'center',
            render: (url) =>
                url ? (
                    <Tooltip title="View Credential">
                        <Button
                            type="link"
                            icon={<LinkOutlined />}
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            View
                        </Button>
                    </Tooltip>
                ) : (
                    <Text type="secondary" style={{ fontSize: 12 }}>
                        -
                    </Text>
                ),
        },
        {
            title: 'Action',
            key: 'action',
            width: 150,
            align: 'center',
            render: (_, record) => (
                <Space size="small">
                    <Tooltip title="Edit">
                        <Button
                            type="primary"
                            icon={<EditOutlined />}
                            size="small"
                            onClick={() =>
                                router.visit(
                                    route('admin.certificate.edit', record.id),
                                )
                            }
                        />
                    </Tooltip>
                    <Popconfirm
                        title="Hapus sertifikat?"
                        description="Data yang dihapus tidak dapat dikembalikan."
                        onConfirm={() => handleDelete(record.id)}
                        okText="Ya, Hapus"
                        cancelText="Batal"
                        okButtonProps={{ danger: true }}
                    >
                        <Tooltip title="Delete">
                            <Button
                                danger
                                icon={<DeleteOutlined />}
                                size="small"
                            />
                        </Tooltip>
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    const handleDelete = (id) => {
        router.delete(route('admin.certificate.destroy', id), {
            preserveScroll: true,
            onSuccess: () => {
                message.success('Sertifikat berhasil dihapus!');
            },
        });
    };

    return (
        <AppLayout header="Certificate Management">
            <div>
                <div
                    style={{
                        marginBottom: 16,
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                    }}
                >
                    <div>
                        <Text strong style={{ fontSize: 16 }}>
                            Total: {certificates.total} Certificates
                        </Text>
                    </div>
                    <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={() =>
                            router.visit(route('admin.certificate.create'))
                        }
                        size="large"
                    >
                        Add Certificate
                    </Button>
                </div>

                <Table
                    dataSource={certificates.data}
                    columns={columns}
                    rowKey="id"
                    pagination={{
                        current: certificates.current_page,
                        pageSize: certificates.per_page,
                        total: certificates.total,
                        showSizeChanger: true,
                        showTotal: (total, range) =>
                            `${range[0]}-${range[1]} of ${total} certificates`,
                        onChange: (page, pageSize) => {
                            router.get(
                                route('admin.certificate.index', {
                                    page,
                                    per_page: pageSize,
                                }),
                                {},
                                { preserveState: true },
                            );
                        },
                    }}
                />
            </div>
        </AppLayout>
    );
}

export default Index;
