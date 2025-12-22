import {
    ArrowLeftOutlined,
    CalendarOutlined,
    EyeOutlined,
    FolderOutlined,
} from '@ant-design/icons';
import { router } from '@inertiajs/react';
import { Alert, Button, Card, Divider, Space, Tag, Typography } from 'antd';
import { route } from 'ziggy-js';
import AppLayout from '../../../layouts/app-layout';

const { Title, Text } = Typography;

export default function BlogPostPreview({ project, blogPost }) {
    return (
        <AppLayout>
            <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                {/* ✅ Back to Edit Button */}
                <div style={{ marginBottom: '24px' }}>
                    <Space>
                        <Button
                            icon={<ArrowLeftOutlined />}
                            onClick={() =>
                                router.visit(
                                    route(
                                        'admin.blog-posts.edit',
                                        blogPost.slug,
                                    ),
                                )
                            }
                        >
                            Kembali ke Edit
                        </Button>
                        <Button
                            type="primary"
                            icon={<EyeOutlined />}
                            onClick={() => {
                                if (blogPost.is_published) {
                                    window.open(
                                        route('projects.blog-posts.show', {
                                            project: project.slug,
                                            blogPost: blogPost.slug,
                                        }),
                                        '_blank',
                                    );
                                }
                            }}
                            disabled={!blogPost.is_published}
                        >
                            Lihat Live Version
                        </Button>
                    </Space>
                </div>

                {/* ✅ Draft Warning */}
                {!blogPost.is_published && (
                    <Alert
                        message="Mode Preview - Draft"
                        description="Blog post ini masih dalam status draft dan belum bisa diakses publik. Publish terlebih dahulu untuk membagikan ke publik."
                        type="warning"
                        showIcon
                        style={{ marginBottom: '24px' }}
                    />
                )}

                {/* ✅ Preview Card (sama seperti public view) */}
                <Card
                    title={
                        <Space>
                            <EyeOutlined />
                            <Text strong>Preview Blog Post</Text>
                        </Space>
                    }
                    style={{
                        boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
                        borderRadius: '12px',
                        overflow: 'hidden',
                    }}
                    bodyStyle={{ padding: 0 }}
                >
                    {/* Header Section */}
                    <div
                        style={{
                            background:
                                'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            padding: '48px 48px 32px',
                            color: 'white',
                        }}
                    >
                        {/* Project Badge */}
                        <Space style={{ marginBottom: '16px' }}>
                            <Tag
                                icon={<FolderOutlined />}
                                color="rgba(255,255,255,0.2)"
                                style={{
                                    color: 'white',
                                    border: '1px solid rgba(255,255,255,0.3)',
                                    fontSize: '14px',
                                    padding: '4px 12px',
                                }}
                            >
                                {project.title}
                            </Tag>
                            {!blogPost.is_published && (
                                <Tag
                                    color="orange"
                                    style={{
                                        fontSize: '14px',
                                        padding: '4px 12px',
                                    }}
                                >
                                    DRAFT
                                </Tag>
                            )}
                        </Space>

                        {/* Title */}
                        <Title
                            level={1}
                            style={{
                                color: 'white',
                                margin: 0,
                                fontSize: '42px',
                                fontWeight: 700,
                                lineHeight: 1.2,
                            }}
                        >
                            {blogPost.title}
                        </Title>

                        {/* Published Date */}
                        <Space style={{ marginTop: '16px', opacity: 0.9 }}>
                            <CalendarOutlined />
                            <Text style={{ color: 'white' }}>
                                {blogPost.published_at
                                    ? `Dipublikasikan ${blogPost.published_at}`
                                    : 'Belum dipublikasikan'}
                            </Text>
                        </Space>
                    </div>

                    <Divider style={{ margin: 0 }} />

                    {/* Content Section */}
                    <div style={{ padding: '48px', background: 'white' }}>
                        <div
                            className="blog-content"
                            dangerouslySetInnerHTML={{
                                __html: blogPost.content,
                            }}
                            style={{
                                fontSize: '18px',
                                lineHeight: '1.8',
                                color: '#2c3e50',
                            }}
                        />

                        <Divider
                            style={{ marginTop: '48px', marginBottom: '24px' }}
                        />

                        <div style={{ textAlign: 'center' }}>
                            <Text type="secondary">
                                Artikel ini merupakan bagian dari project{' '}
                                <Text strong style={{ color: '#1890ff' }}>
                                    {project.title}
                                </Text>
                            </Text>
                        </div>
                    </div>
                </Card>

                {/* ✅ Reuse CSS dari component public */}
                <style>{`
                    .blog-content {
                        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
                    }

                    .blog-content h1, .blog-content h2, .blog-content h3,
                    .blog-content h4, .blog-content h5, .blog-content h6 {
                        color: #1a202c;
                        font-weight: 700;
                        margin-top: 2em;
                        margin-bottom: 0.75em;
                        line-height: 1.3;
                    }

                    .blog-content h1 { font-size: 2.25em; }
                    .blog-content h2 { font-size: 1.875em; }
                    .blog-content h3 { font-size: 1.5em; }
                    .blog-content h4 { font-size: 1.25em; }

                    .blog-content > h1:first-child,
                    .blog-content > h2:first-child,
                    .blog-content > h3:first-child {
                        margin-top: 0;
                    }

                    .blog-content p {
                        margin-bottom: 1.5em;
                        line-height: 1.8;
                    }

                    .blog-content a {
                        color: #1890ff;
                        text-decoration: none;
                        border-bottom: 1px solid transparent;
                        transition: border-color 0.3s;
                    }

                    .blog-content a:hover {
                        border-bottom-color: #1890ff;
                    }

                    .blog-content ul, .blog-content ol {
                        margin-bottom: 1.5em;
                        padding-left: 2em;
                    }

                    .blog-content li {
                        margin-bottom: 0.5em;
                        line-height: 1.8;
                    }

                    .blog-content blockquote {
                        margin: 2em 0;
                        padding: 1em 1.5em;
                        background: #f9fafb;
                        border-left: 4px solid #1890ff;
                        font-style: italic;
                        color: #4a5568;
                    }

                    .blog-content pre {
                        background: #2d3748;
                        color: #e2e8f0;
                        padding: 1.5em;
                        border-radius: 8px;
                        overflow-x: auto;
                        margin: 1.5em 0;
                        font-family: 'Courier New', monospace;
                        font-size: 0.9em;
                        line-height: 1.6;
                    }

                    .blog-content code {
                        background: #f1f5f9;
                        color: #e53e3e;
                        padding: 0.2em 0.4em;
                        border-radius: 4px;
                        font-family: 'Courier New', monospace;
                        font-size: 0.9em;
                    }

                    .blog-content pre code {
                        background: transparent;
                        color: inherit;
                        padding: 0;
                    }

                    .blog-content img {
                        max-width: 100%;
                        height: auto;
                        border-radius: 8px;
                        margin: 2em 0;
                        box-shadow: 0 4px 12px rgba(0,0,0,0.1);
                    }

                    .blog-content table {
                        width: 100%;
                        border-collapse: collapse;
                        margin: 2em 0;
                        font-size: 0.95em;
                    }

                    .blog-content table th,
                    .blog-content table td {
                        padding: 12px 16px;
                        text-align: left;
                        border: 1px solid #e2e8f0;
                    }

                    .blog-content table th {
                        background: #f7fafc;
                        font-weight: 600;
                        color: #2d3748;
                    }

                    .blog-content table tr:hover {
                        background: #f9fafb;
                    }

                    .blog-content hr {
                        border: none;
                        border-top: 2px solid #e2e8f0;
                        margin: 3em 0;
                    }

                    .blog-content strong {
                        font-weight: 700;
                        color: #1a202c;
                    }

                    @media (max-width: 768px) {
                        .blog-content {
                            font-size: 16px;
                        }
                        .blog-content h1 { font-size: 1.75em; }
                        .blog-content h2 { font-size: 1.5em; }
                        .blog-content h3 { font-size: 1.25em; }
                    }
                `}</style>
            </div>
        </AppLayout>
    );
}
