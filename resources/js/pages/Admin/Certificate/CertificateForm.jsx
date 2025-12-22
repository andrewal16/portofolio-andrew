import {
    ArrowLeftOutlined,
    FileImageOutlined,
    FilePdfOutlined,
    LinkOutlined,
    PlusOutlined,
    SaveOutlined,
    UploadOutlined,
} from '@ant-design/icons';
import { router, usePage } from '@inertiajs/react';
import {
    Button,
    Card,
    ColorPicker,
    DatePicker,
    Form,
    Image,
    Input,
    message,
    Modal,
    Select,
    Space,
    Tag,
    Upload,
} from 'antd';
import dayjs from 'dayjs';
import { useEffect, useState } from 'react';
import { route } from 'ziggy-js';
import AppLayout from '../../../layouts/app-layout';

const { TextArea } = Input;

function CertificateForm() {
    const { typeForm, certificate, availableTags, errors, flash } =
        usePage().props;
    const [form] = Form.useForm();
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(
        certificate?.image_url || null,
    );
    const [fileType, setFileType] = useState(certificate?.file_type || 'image'); // 'image' atau 'pdf'
    const [tags, setTags] = useState(availableTags || []);
    const [selectedTags, setSelectedTags] = useState(certificate?.tags || []);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [newTagForm] = Form.useForm();
    const [newTagColor, setNewTagColor] = useState('#1890ff');
    const [processing, setProcessing] = useState(false);
    const [creatingTag, setCreatingTag] = useState(false);

    useEffect(() => {
        if (typeForm === 'edit' && certificate) {
            form.setFieldsValue({
                name: certificate.name,
                issuer: certificate.issuer,
                issued_at: certificate.issued_at
                    ? dayjs(certificate.issued_at)
                    : null,
                credential_id: certificate.credential_id,
                credential_url: certificate.credential_url,
                tags: certificate.tags,
            });
            setImagePreview(certificate.image_url);
            setSelectedTags(certificate.tags);

            // 🔥 Deteksi tipe file dari URL
            if (certificate.image_url) {
                const isPdf = certificate.image_url
                    .toLowerCase()
                    .endsWith('.pdf');
                setFileType(isPdf ? 'pdf' : 'image');
            }
        }
    }, [typeForm, certificate, form]);

    useEffect(() => {
        if (flash?.success) {
            message.success(flash.success);
        }
    }, [flash]);

    useEffect(() => {
        if (errors && Object.keys(errors).length > 0) {
            const formattedErrors = Object.keys(errors).map((key) => ({
                name: key,
                errors: [errors[key]],
            }));
            form.setFields(formattedErrors);
            message.error('Ada kesalahan dalam form! Cek lagi ya.');
        }
    }, [errors, form]);

    const handleImageChange = (info) => {
        if (info.file.status === 'removed') {
            setImageFile(null);
            setImagePreview(null);
            setFileType('image');
            return;
        }

        const file = info.file.originFileObj || info.file;

        // 🔥 VALIDASI: Cek tipe file
        const isPdf = file.type === 'application/pdf';
        const isImage = [
            'image/jpeg',
            'image/jpg',
            'image/png',
            'image/webp',
        ].includes(file.type);

        if (!isPdf && !isImage) {
            message.error('Format file harus JPG, PNG, WEBP, atau PDF!');
            return;
        }

        // 🔥 VALIDASI: Ukuran file berbeda untuk PDF dan Image
        const maxSize = isPdf ? 10 * 1024 * 1024 : 5 * 1024 * 1024; // 10MB untuk PDF, 5MB untuk image
        if (file.size > maxSize) {
            const maxSizeMB = isPdf ? '10MB' : '5MB';
            message.error(`Ukuran file maksimal ${maxSizeMB}!`);
            return;
        }

        // Set tipe file
        setFileType(isPdf ? 'pdf' : 'image');

        // Generate preview
        const reader = new FileReader();
        reader.onload = (e) => {
            setImagePreview(e.target.result);
        };
        reader.readAsDataURL(file);

        setImageFile(file);
    };

    const showCreateTagModal = () => {
        setIsModalVisible(true);
        newTagForm.resetFields();
        setNewTagColor('#1890ff');
    };

    const handleCreateTag = async () => {
        try {
            const values = await newTagForm.validateFields();
            setCreatingTag(true);

            const response = await fetch(route('admin.tags.store'), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector(
                        'meta[name="csrf-token"]',
                    ).content,
                },
                body: JSON.stringify({
                    name: values.name,
                    color: newTagColor,
                }),
            });

            const data = await response.json();

            if (data.success) {
                const newTag = data.data;
                setTags([...tags, newTag]);
                setSelectedTags([...selectedTags, newTag.value]);
                form.setFieldValue('tags', [...selectedTags, newTag.value]);
                message.success('Tag berhasil dibuat!');
                setIsModalVisible(false);
            } else {
                message.error('Gagal membuat tag!');
            }
        } catch (error) {
            message.error('Gagal membuat tag!');
        } finally {
            setCreatingTag(false);
        }
    };

    const handleSubmit = (values) => {
        if (!values.name || !values.issuer || !values.issued_at) {
            message.error('Lengkapi data wajib terlebih dahulu!');
            return;
        }

        setProcessing(true);
        const formData = new FormData();

        formData.append('name', values.name);
        formData.append('issuer', values.issuer);
        formData.append(
            'issued_at',
            dayjs(values.issued_at).format('YYYY-MM-DD'),
        );

        if (values.credential_id) {
            formData.append('credential_id', values.credential_id);
        }
        if (values.credential_url) {
            formData.append('credential_url', values.credential_url);
        }
        if (imageFile) {
            formData.append('image', imageFile);
        }

        if (values.tags && values.tags.length > 0) {
            values.tags.forEach((tagId) => {
                formData.append('tags[]', tagId);
            });
        } else {
            formData.append('tags', JSON.stringify([]));
        }

        if (typeForm === 'create') {
            router.post(route('admin.certificate.store'), formData, {
                preserveScroll: true,
                onFinish: () => {
                    setProcessing(false);
                },
                onSuccess: () => {
                    message.success('Sertifikat berhasil dibuat!');
                    form.resetFields();
                    setImageFile(null);
                    setImagePreview(null);
                    setFileType('image');
                    router.visit(route('admin.certificate.index'));
                },
                onError: (errors) => {
                    console.error('Submit error:', errors);
                    message.error('Gagal menyimpan sertifikat!');
                },
            });
        } else {
            formData.append('_method', 'PUT');
            router.post(
                route('admin.certificate.update', certificate.id),
                formData,
                {
                    preserveScroll: true,
                    onFinish: () => {
                        setProcessing(false);
                    },
                    onSuccess: () => {
                        message.success('Sertifikat berhasil diupdate!');
                        router.visit(route('admin.certificate.index'));
                    },
                    onError: (errors) => {
                        console.error('Update error:', errors);
                        message.error('Gagal update sertifikat!');
                    },
                },
            );
        }
    };

    // 🔥 Component untuk render preview berdasarkan tipe file
    const renderFilePreview = () => {
        if (!imagePreview) return null;

        if (fileType === 'pdf') {
            return (
                <Card
                    size="small"
                    style={{ marginTop: 16 }}
                    title={
                        <Space>
                            <FilePdfOutlined style={{ color: '#ff4d4f' }} />
                            <span>PDF Preview</span>
                        </Space>
                    }
                >
                    <iframe
                        src={imagePreview}
                        style={{
                            width: '100%',
                            height: '600px',
                            border: '1px solid #f0f0f0',
                            borderRadius: 8,
                        }}
                        title="Certificate PDF Preview"
                    />
                    <div style={{ marginTop: 8, textAlign: 'center' }}>
                        <Button
                            type="link"
                            href={imagePreview}
                            target="_blank"
                            icon={<FilePdfOutlined />}
                        >
                            Buka PDF di Tab Baru
                        </Button>
                    </div>
                </Card>
            );
        }

        // Image preview
        return (
            <div style={{ marginTop: 16 }}>
                <Image
                    src={imagePreview}
                    alt="Certificate Preview"
                    style={{
                        maxWidth: 400,
                        borderRadius: 8,
                    }}
                />
            </div>
        );
    };

    return (
        <AppLayout
            header={
                typeForm === 'create'
                    ? 'Create New Certificate'
                    : 'Edit Certificate'
            }
        >
            <Card>
                <Form form={form} layout="vertical" onFinish={handleSubmit}>
                    {/* Certificate Name */}
                    <Form.Item
                        label="Certificate Name"
                        name="name"
                        rules={[
                            {
                                required: true,
                                message: 'Nama sertifikat wajib diisi!',
                            },
                        ]}
                    >
                        <Input
                            placeholder="Contoh: Belajar Dasar Data Science"
                            size="large"
                        />
                    </Form.Item>

                    {/* Issuer */}
                    <Form.Item
                        label="Issuer / Platform"
                        name="issuer"
                        rules={[
                            {
                                required: true,
                                message: 'Penerbit wajib diisi!',
                            },
                        ]}
                    >
                        <Input
                            placeholder="Contoh: Dicoding, Coursera, Udemy"
                            size="large"
                        />
                    </Form.Item>

                    {/* Issued Date */}
                    <Form.Item
                        label="Issued Date"
                        name="issued_at"
                        rules={[
                            {
                                required: true,
                                message: 'Tanggal terbit wajib diisi!',
                            },
                        ]}
                    >
                        <DatePicker
                            style={{ width: '100%' }}
                            format="DD/MM/YYYY"
                            size="large"
                        />
                    </Form.Item>

                    {/* Credential ID */}
                    <Form.Item
                        label="Credential ID (Optional)"
                        name="credential_id"
                        extra="Nomor sertifikat, contoh: 1OP8WOGE2XQK"
                    >
                        <Input placeholder="1OP8WOGE2XQK" />
                    </Form.Item>

                    {/* Credential URL */}
                    <Form.Item
                        label="Credential URL (Optional)"
                        name="credential_url"
                        extra="Link ke platform resmi (Dicoding, Coursera, dll)"
                    >
                        <Input
                            prefix={<LinkOutlined />}
                            placeholder="https://www.dicoding.com/certificates/..."
                        />
                    </Form.Item>

                    {/* Tags dengan Create New */}
                    <Form.Item label="Tags" name="tags">
                        <Select
                            mode="multiple"
                            placeholder="Pilih atau buat tag baru"
                            size="large"
                            value={selectedTags}
                            onChange={setSelectedTags}
                            dropdownRender={(menu) => (
                                <>
                                    {menu}
                                    <div
                                        style={{
                                            padding: '8px',
                                            borderTop: '1px solid #f0f0f0',
                                        }}
                                    >
                                        <Button
                                            type="dashed"
                                            block
                                            icon={<PlusOutlined />}
                                            onClick={showCreateTagModal}
                                        >
                                            Create New Tag
                                        </Button>
                                    </div>
                                </>
                            )}
                            tagRender={(props) => {
                                const tag = tags.find(
                                    (t) => t.value === props.value,
                                );
                                return (
                                    <Tag
                                        color={tag?.color || '#1890ff'}
                                        closable={props.closable}
                                        onClose={props.onClose}
                                        style={{ marginRight: 3 }}
                                    >
                                        {props.label}
                                    </Tag>
                                );
                            }}
                        >
                            {tags.map((tag) => (
                                <Select.Option
                                    key={tag.value}
                                    value={tag.value}
                                >
                                    <Tag color={tag.color}>{tag.label}</Tag>
                                </Select.Option>
                            ))}
                        </Select>
                    </Form.Item>

                    {/* 🔥 Image/PDF Upload dengan info yang jelas */}
                    <Form.Item
                        label={
                            <Space>
                                <span>Certificate File</span>
                                {fileType === 'pdf' ? (
                                    <Tag
                                        icon={<FilePdfOutlined />}
                                        color="error"
                                    >
                                        PDF
                                    </Tag>
                                ) : (
                                    <Tag
                                        icon={<FileImageOutlined />}
                                        color="blue"
                                    >
                                        Image
                                    </Tag>
                                )}
                            </Space>
                        }
                        extra="Format: JPG, PNG, WEBP (max 5MB) atau PDF (max 10MB)"
                    >
                        <Space direction="vertical" style={{ width: '100%' }}>
                            <Upload
                                listType="picture"
                                maxCount={1}
                                beforeUpload={() => false}
                                onChange={handleImageChange}
                                onRemove={() => {
                                    setImageFile(null);
                                    setImagePreview(null);
                                    setFileType('image');
                                }}
                                accept="image/jpeg,image/jpg,image/png,image/webp,application/pdf"
                            >
                                <Button icon={<UploadOutlined />}>
                                    Upload Certificate (Image / PDF)
                                </Button>
                            </Upload>

                            {renderFilePreview()}
                        </Space>
                    </Form.Item>

                    {/* Action Buttons */}
                    <Form.Item>
                        <Space>
                            <Button
                                type="primary"
                                htmlType="submit"
                                icon={<SaveOutlined />}
                                loading={processing}
                                size="large"
                            >
                                {typeForm === 'create'
                                    ? 'Create Certificate'
                                    : 'Update Certificate'}
                            </Button>
                            <Button
                                icon={<ArrowLeftOutlined />}
                                onClick={() =>
                                    router.visit(
                                        route('admin.certificate.index'),
                                    )
                                }
                                size="large"
                            >
                                Back to List
                            </Button>
                        </Space>
                    </Form.Item>
                </Form>
            </Card>

            {/* Modal Create Tag */}
            <Modal
                title="Create New Tag"
                open={isModalVisible}
                onOk={handleCreateTag}
                onCancel={() => setIsModalVisible(false)}
                okText="Create"
                confirmLoading={creatingTag}
            >
                <Form form={newTagForm} layout="vertical">
                    <Form.Item
                        label="Tag Name"
                        name="name"
                        rules={[
                            {
                                required: true,
                                message: 'Nama tag wajib diisi!',
                            },
                        ]}
                    >
                        <Input placeholder="Contoh: AI, Deep Learning" />
                    </Form.Item>

                    <Form.Item label="Tag Color">
                        <ColorPicker
                            value={newTagColor}
                            onChange={(color) =>
                                setNewTagColor(color.toHexString())
                            }
                            showText
                        />
                        <div style={{ marginTop: 8 }}>
                            <Tag color={newTagColor}>Preview Tag</Tag>
                        </div>
                    </Form.Item>
                </Form>
            </Modal>
        </AppLayout>
    );
}

export default CertificateForm;
