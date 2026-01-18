import {
    ArrowLeftOutlined,
    BookOutlined,
    FileImageOutlined,
    FilePdfOutlined,
    LinkOutlined,
    PlusOutlined,
    SaveOutlined,
    TrophyOutlined,
    UploadOutlined,
} from '@ant-design/icons';
import { router, usePage } from '@inertiajs/react';
import {
    Button,
    Card,
    Col,
    ColorPicker,
    DatePicker,
    Form,
    Image,
    Input,
    message,
    Modal,
    Row,
    Select,
    Space,
    Tag,
    Upload,
} from 'antd';
import dayjs from 'dayjs';
import { useEffect, useState } from 'react';
import { route } from 'ziggy-js';
import AppLayout from '../../../layouts/app-layout';

function CertificateForm() {
    const {
        typeForm,
        certificate,
        availableTags,
        categoryOptions,
        errors,
        flash,
    } = usePage().props;
    const [form] = Form.useForm();
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(
        certificate?.image_url || null,
    );
    const [fileType, setFileType] = useState('image');
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
                category: certificate.category || 'learning',
                tags: certificate.tags,
            });
            setImagePreview(certificate.image_url);
            setSelectedTags(certificate.tags);

            if (certificate.image_url) {
                const isPdf = certificate.image_url
                    .toLowerCase()
                    .endsWith('.pdf');
                setFileType(isPdf ? 'pdf' : 'image');
            }
        }
    }, [typeForm, certificate, form]);

    useEffect(() => {
        if (flash?.success) message.success(flash.success);
    }, [flash]);

    useEffect(() => {
        if (errors && Object.keys(errors).length > 0) {
            const formattedErrors = Object.keys(errors).map((key) => ({
                name: key,
                errors: [errors[key]],
            }));
            form.setFields(formattedErrors);
            message.error('Please check the form for errors!');
        }
    }, [errors, form]);

    useEffect(() => {
        if (availableTags) setTags(availableTags);
    }, [availableTags]);

    const handleImageChange = (info) => {
        if (info.file.status === 'removed') {
            setImageFile(null);
            setImagePreview(null);
            setFileType('image');
            return;
        }

        const file = info.file.originFileObj || info.file;
        const isPdf = file.type === 'application/pdf';
        const isImage = [
            'image/jpeg',
            'image/jpg',
            'image/png',
            'image/webp',
        ].includes(file.type);

        if (!isPdf && !isImage) {
            message.error('Only JPG, PNG, WEBP, or PDF files allowed!');
            return;
        }

        const maxSize = isPdf ? 10 * 1024 * 1024 : 5 * 1024 * 1024;
        if (file.size > maxSize) {
            message.error(`Max size: ${isPdf ? '10MB' : '5MB'}!`);
            return;
        }

        setFileType(isPdf ? 'pdf' : 'image');

        const reader = new FileReader();
        reader.onload = (e) => setImagePreview(e.target.result);
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

            router.post(
                route('admin.tags.store'),
                { name: values.name, color: newTagColor },
                {
                    preserveScroll: true,
                    preserveState: true,
                    only: ['availableTags', 'flash'],
                    onSuccess: (page) => {
                        setIsModalVisible(false);
                        newTagForm.resetFields();
                        const newTag = page.props.availableTags.find(
                            (t) => t.label === values.name,
                        );
                        if (newTag)
                            setSelectedTags((prev) => [...prev, newTag.value]);
                    },
                    onError: (errors) => {
                        message.error(
                            Object.values(errors).flat()[0] ||
                                'Failed to create tag!',
                        );
                    },
                    onFinish: () => setCreatingTag(false),
                },
            );
        } catch (error) {
            setCreatingTag(false);
        }
    };

    const handleSubmit = (values) => {
        if (!values.name || !values.issuer || !values.issued_at) {
            message.error('Please fill in all required fields!');
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
        formData.append('category', values.category || 'learning');

        if (values.credential_id)
            formData.append('credential_id', values.credential_id);
        if (values.credential_url)
            formData.append('credential_url', values.credential_url);
        if (imageFile) formData.append('image', imageFile);

        if (values.tags?.length > 0) {
            values.tags.forEach((tagId) => formData.append('tags[]', tagId));
        } else {
            formData.append('tags', JSON.stringify([]));
        }

        const options = {
            preserveScroll: true,
            onFinish: () => setProcessing(false),
            onSuccess: () => {
                message.success(
                    typeForm === 'create'
                        ? 'Certificate created!'
                        : 'Certificate updated!',
                );
                router.visit(route('admin.certificate.index'));
            },
            onError: () => message.error('Failed to save certificate!'),
        };

        if (typeForm === 'create') {
            router.post(route('admin.certificate.store'), formData, options);
        } else {
            formData.append('_method', 'PUT');
            router.post(
                route('admin.certificate.update', certificate.id),
                formData,
                options,
            );
        }
    };

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
                            height: 400,
                            border: '1px solid #f0f0f0',
                            borderRadius: 8,
                        }}
                        title="PDF Preview"
                    />
                </Card>
            );
        }

        return (
            <div style={{ marginTop: 16 }}>
                <Image
                    src={imagePreview}
                    alt="Preview"
                    style={{ maxWidth: 400, borderRadius: 8 }}
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
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleSubmit}
                    initialValues={{ category: 'learning' }}
                >
                    <Row gutter={24}>
                        <Col xs={24} lg={16}>
                            {/* Certificate Name */}
                            <Form.Item
                                label="Certificate Name"
                                name="name"
                                rules={[
                                    { required: true, message: 'Required!' },
                                ]}
                            >
                                <Input
                                    placeholder="e.g., Data Science Fundamentals"
                                    size="large"
                                />
                            </Form.Item>

                            {/* Issuer */}
                            <Form.Item
                                label="Issuer / Platform"
                                name="issuer"
                                rules={[
                                    { required: true, message: 'Required!' },
                                ]}
                            >
                                <Input
                                    placeholder="e.g., Dicoding, Coursera"
                                    size="large"
                                />
                            </Form.Item>

                            <Row gutter={16}>
                                {/* Issued Date */}
                                <Col span={12}>
                                    <Form.Item
                                        label="Issued Date"
                                        name="issued_at"
                                        rules={[
                                            {
                                                required: true,
                                                message: 'Required!',
                                            },
                                        ]}
                                    >
                                        <DatePicker
                                            style={{ width: '100%' }}
                                            format="DD/MM/YYYY"
                                            size="large"
                                        />
                                    </Form.Item>
                                </Col>

                                {/* ✅ NEW: Category */}
                                <Col span={12}>
                                    <Form.Item
                                        label="Category"
                                        name="category"
                                        rules={[
                                            {
                                                required: true,
                                                message: 'Required!',
                                            },
                                        ]}
                                    >
                                        <Select
                                            size="large"
                                            placeholder="Select category"
                                        >
                                            <Select.Option value="learning">
                                                <Space>
                                                    <BookOutlined
                                                        style={{
                                                            color: '#1890ff',
                                                        }}
                                                    />
                                                    Learning / Course
                                                </Space>
                                            </Select.Option>
                                            <Select.Option value="competition">
                                                <Space>
                                                    <TrophyOutlined
                                                        style={{
                                                            color: '#faad14',
                                                        }}
                                                    />
                                                    Competition / Award
                                                </Space>
                                            </Select.Option>
                                        </Select>
                                    </Form.Item>
                                </Col>
                            </Row>

                            {/* Credential ID */}
                            <Form.Item
                                label="Credential ID (Optional)"
                                name="credential_id"
                                extra="Certificate number, e.g., 1OP8WOGE2XQK"
                            >
                                <Input placeholder="1OP8WOGE2XQK" />
                            </Form.Item>

                            {/* Credential URL */}
                            <Form.Item
                                label="Credential URL (Optional)"
                                name="credential_url"
                                extra="Link to official verification"
                            >
                                <Input
                                    prefix={<LinkOutlined />}
                                    placeholder="https://www.dicoding.com/certificates/..."
                                />
                            </Form.Item>

                            {/* Tags */}
                            <Form.Item label="Tags" name="tags">
                                <Select
                                    mode="multiple"
                                    placeholder="Select or create tags"
                                    size="large"
                                    value={selectedTags}
                                    onChange={setSelectedTags}
                                    dropdownRender={(menu) => (
                                        <>
                                            {menu}
                                            <div
                                                style={{
                                                    padding: 8,
                                                    borderTop:
                                                        '1px solid #f0f0f0',
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
                                            <Tag color={tag.color}>
                                                {tag.label}
                                            </Tag>
                                        </Select.Option>
                                    ))}
                                </Select>
                            </Form.Item>
                        </Col>

                        <Col xs={24} lg={8}>
                            {/* File Upload */}
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
                                extra="JPG, PNG, WEBP (max 5MB) or PDF (max 10MB)"
                            >
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
                                    <Button icon={<UploadOutlined />} block>
                                        Upload Certificate
                                    </Button>
                                </Upload>

                                {renderFilePreview()}
                            </Form.Item>
                        </Col>
                    </Row>

                    {/* Action Buttons */}
                    <Form.Item style={{ marginTop: 24 }}>
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
                        rules={[{ required: true, message: 'Required!' }]}
                    >
                        <Input placeholder="e.g., AI, Machine Learning" />
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
