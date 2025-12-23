import { router, useForm } from '@inertiajs/react';
import { Editor } from '@tinymce/tinymce-react';
import {
    Button,
    Card,
    Form,
    Input,
    message,
    Select,
    Space,
    Spin,
    Switch,
} from 'antd';
import { useEffect, useRef } from 'react';
import { route } from 'ziggy-js';
import AppLayout from '../../../layouts/app-layout';

export default function BlogPostForm({ typeForm, blogPost, projects }) {
    const [form] = Form.useForm();
    const editorRef = useRef(null);

    const { data, setData, post, put, processing, errors, wasSuccessful } =
        useForm({
            project_id: blogPost?.project_id || undefined,
            title: blogPost?.title || '',
            slug: blogPost?.slug || '',
            content: blogPost?.content || '',
            is_published: blogPost?.is_published || false,
        });

    // Handle success redirect
    useEffect(() => {
        if (wasSuccessful) {
            const successMsg =
                typeForm === 'create'
                    ? 'Blog post berhasil dibuat!'
                    : 'Blog post berhasil diupdate!';

            message.success(successMsg);

            setTimeout(() => {
                router.visit(route('admin.blog-posts.index'));
            }, 500);
        }
    }, [wasSuccessful, typeForm]);

    const handleSubmit = (values) => {
        // ✅ Ambil content dari TinyMCE
        const editorContent = editorRef.current
            ? editorRef.current.getContent()
            : data.content;
    
        // ✅ UPDATE state dulu SEBELUM submit
        setData('content', editorContent);
    
        // ✅ CARA 1: Pakai useForm's method (RECOMMENDED)
        const options = {
            preserveScroll: true,
            // ⚠️ IMPORTANT: data sudah include editorContent setelah setData di atas
            data: {
                ...data,
                content: editorContent, // Pastikan content terupdate
            },
            onError: (errors) => {
                console.error('Validation Errors:', errors);
                message.error('Gagal menyimpan. Periksa form kembali.');
            },
            onSuccess: () => {
                console.log('✅ Save successful!');
            },
        };
    
        if (typeForm === 'create') {
            post(route('admin.blog-posts.store'), options);
        } else {
            put(route('admin.blog-posts.update', blogPost.slug), options);
        }
    };

    return (
        <AppLayout>
            <Spin spinning={processing} tip="Menyimpan data..." size="large">
                <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                    <Card
                        title={
                            typeForm === 'create'
                                ? '📝 Buat Blog Post Baru'
                                : '✏️ Edit Blog Post'
                        }
                    >
                        <Form
                            form={form}
                            layout="vertical"
                            onFinish={handleSubmit}
                            initialValues={data}
                        >
                            {/* Project Selection */}
                            <Form.Item
                                label={
                                    <span style={{ fontWeight: 600 }}>
                                        Project
                                    </span>
                                }
                                name="project_id"
                                rules={[
                                    {
                                        required: true,
                                        message: 'Project harus dipilih!',
                                    },
                                ]}
                                validateStatus={
                                    errors.project_id ? 'error' : ''
                                }
                                help={errors.project_id}
                            >
                                <Select
                                    placeholder="Pilih project"
                                    options={projects}
                                    onChange={(value) =>
                                        setData('project_id', value)
                                    }
                                    showSearch
                                    filterOption={(input, option) =>
                                        (option?.label ?? '')
                                            .toLowerCase()
                                            .includes(input.toLowerCase())
                                    }
                                    size="large"
                                    disabled={processing}
                                />
                            </Form.Item>

                            {/* Title */}
                            <Form.Item
                                label={
                                    <span style={{ fontWeight: 600 }}>
                                        Judul
                                    </span>
                                }
                                name="title"
                                rules={[
                                    {
                                        required: true,
                                        message: 'Judul harus diisi!',
                                    },
                                ]}
                                validateStatus={errors.title ? 'error' : ''}
                                help={errors.title}
                            >
                                <Input
                                    placeholder="Contoh: Pembahasan Model User"
                                    onChange={(e) =>
                                        setData('title', e.target.value)
                                    }
                                    size="large"
                                    disabled={processing}
                                />
                            </Form.Item>

                            {/* Slug */}
                            <Form.Item
                                label={
                                    <span style={{ fontWeight: 600 }}>
                                        Slug{' '}
                                        <span
                                            style={{
                                                fontWeight: 400,
                                                color: '#999',
                                            }}
                                        >
                                            (Opsional, auto-generate jika
                                            kosong)
                                        </span>
                                    </span>
                                }
                                name="slug"
                                validateStatus={errors.slug ? 'error' : ''}
                                help={errors.slug}
                            >
                                <Input
                                    placeholder="pembahasan-model-user"
                                    onChange={(e) =>
                                        setData('slug', e.target.value)
                                    }
                                    size="large"
                                    disabled={processing}
                                />
                            </Form.Item>

                            {/* ✅ FIX 4: TinyMCE dengan plugin minimal */}
                            <Form.Item
                                label={
                                    <span style={{ fontWeight: 600 }}>
                                        Konten
                                    </span>
                                }
                                validateStatus={errors.content ? 'error' : ''}
                                help={errors.content}
                                style={{ marginBottom: '24px' }}
                            >
                                <div
                                    style={{
                                        border: '1px solid #d9d9d9',
                                        borderRadius: '8px',
                                        overflow: 'hidden',
                                    }}
                                >
                                    <Editor
                                        apiKey={
                                            import.meta.env
                                                .VITE_TINYMCE_API_KEY ||
                                            'no-api-key'
                                        }
                                        onInit={(evt, editor) =>
                                            (editorRef.current = editor)
                                        }
                                        initialValue={data.content}
                                        disabled={processing}
                                        init={{
                                            height: 500,
                                            menubar: true,

                                            // ✅ PLUGIN MINIMAL - Hindari 404
                                            plugins: [
                                                'lists',
                                                'link',
                                                'code',
                                                'table',
                                                'searchreplace',
                                                'fullscreen',
                                            ],

                                            toolbar:
                                                'undo redo | blocks | bold italic forecolor | ' +
                                                'alignleft aligncenter alignright alignjustify | ' +
                                                'bullist numlist | link | code | fullscreen',

                                            content_style:
                                                'body { font-family:Helvetica,Arial,sans-serif; font-size:14px }',
                                            resize: false,

                                            // ✅ Tambahan: Better error handling
                                            setup: (editor) => {
                                                editor.on('init', () => {
                                                    console.log(
                                                        '✅ TinyMCE loaded successfully',
                                                    );
                                                });
                                            },
                                        }}
                                    />
                                </div>
                            </Form.Item>

                            {/* Publish Status */}
                            <Form.Item
                                label={
                                    <span style={{ fontWeight: 600 }}>
                                        Status Publikasi
                                    </span>
                                }
                                name="is_published"
                                valuePropName="checked"
                            >
                                <Switch
                                    checkedChildren="✓ Published"
                                    unCheckedChildren="Draft"
                                    onChange={(checked) =>
                                        setData('is_published', checked)
                                    }
                                    disabled={processing}
                                />
                            </Form.Item>

                            {/* Action Buttons */}
                            <Form.Item
                                style={{ marginTop: '32px', marginBottom: 0 }}
                            >
                                <Space size="middle">
                                    <Button
                                        type="primary"
                                        htmlType="submit"
                                        loading={processing}
                                        style={{ minWidth: '150px' }}
                                    >
                                        {typeForm === 'create'
                                            ? 'Buat Blog Post'
                                            : 'Update Blog Post'}
                                    </Button>
                                    <Button
                                        onClick={() =>
                                            router.visit(
                                                route('admin.blog-posts.index'),
                                            )
                                        }
                                        disabled={processing}
                                        size="large"
                                    >
                                        Batal
                                    </Button>
                                </Space>
                            </Form.Item>
                        </Form>
                    </Card>
                </div>
            </Spin>
        </AppLayout>
    );
}
