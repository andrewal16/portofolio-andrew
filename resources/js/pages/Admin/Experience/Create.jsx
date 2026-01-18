import {
    ArrowLeftOutlined,
    DeleteOutlined,
    PlusOutlined,
    SaveOutlined,
    UploadOutlined,
} from '@ant-design/icons';
import { Link, router } from '@inertiajs/react';
import {
    Button,
    Card,
    Col,
    DatePicker,
    Form,
    Input,
    InputNumber,
    Row,
    Select,
    Space,
    Switch,
    Typography,
    Upload,
    message,
} from 'antd';
import { useState } from 'react';
import AppLayout from '../../../layouts/app-layout';

const { Title, Text } = Typography;
const { TextArea } = Input;

export default function ExperienceCreate() {
    const [formInstance] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [logoFile, setLogoFile] = useState(null);
    const [galleryFiles, setGalleryFiles] = useState([]);

    const handleSubmit = (values) => {
        setLoading(true);
        const formData = new FormData();

        formData.append('company_name', values.company_name);
        formData.append('position', values.position);
        formData.append('employment_type', values.employment_type);
        formData.append('location', values.location);
        formData.append('is_remote', values.is_remote ? 1 : 0);
        formData.append('description', values.description);
        formData.append('is_featured', values.is_featured ? 1 : 0);
        formData.append('is_published', values.is_published ? 1 : 0);
        formData.append('start_date', values.start_date.format('YYYY-MM-DD'));

        if (values.end_date)
            formData.append('end_date', values.end_date.format('YYYY-MM-DD'));
        if (values.detailed_description)
            formData.append(
                'detailed_description',
                values.detailed_description,
            );
        if (values.display_order !== undefined)
            formData.append('display_order', values.display_order);

        // ✅ FIX: Append arrays properly
        if (values.key_achievements?.length > 0) {
            values.key_achievements.forEach((item, index) => {
                formData.append(`key_achievements[${index}]`, item);
            });
        }

        if (values.metrics?.length > 0) {
            values.metrics.forEach((item, index) => {
                formData.append(`metrics[${index}]`, item);
            });
        }

        if (values.tech_stack?.length > 0) {
            values.tech_stack.forEach((item, index) => {
                formData.append(`tech_stack[${index}]`, item);
            });
        }

        if (logoFile) formData.append('company_logo', logoFile);

        galleryFiles.forEach((file, index) => {
            formData.append(`gallery[${index}]`, file);
        });

        router.post(route('admin.experience.store'), formData, {
            forceFormData: true,
            onSuccess: () => {
                setLoading(false);
                message.success('Experience created successfully!');
            },
            onError: (errors) => {
                setLoading(false);
                message.error('Please check the form for errors');
                console.error(errors);
            },
        });
    };

    const logoProps = {
        beforeUpload: (file) => {
            if (!file.type.startsWith('image/')) {
                message.error('You can only upload image files!');
                return false;
            }
            if (file.size / 1024 / 1024 >= 2) {
                message.error('Image must be smaller than 2MB!');
                return false;
            }
            setLogoFile(file);
            return false;
        },
        onRemove: () => setLogoFile(null),
        fileList: logoFile ? [logoFile] : [],
    };

    const galleryProps = {
        beforeUpload: (file) => {
            if (!file.type.startsWith('image/')) {
                message.error('You can only upload image files!');
                return false;
            }
            if (file.size / 1024 / 1024 >= 5) {
                message.error('Image must be smaller than 5MB!');
                return false;
            }
            setGalleryFiles((prev) => [...prev, file]);
            return false;
        },
        onRemove: (file) => {
            setGalleryFiles((prev) => prev.filter((f) => f.uid !== file.uid));
        },
        fileList: galleryFiles,
        multiple: true,
    };

    return (
        <AppLayout
            header={
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    <Link href={route('admin.experience.index')}>
                        <Button icon={<ArrowLeftOutlined />}>Back</Button>
                    </Link>
                    <div>
                        <Title level={2} style={{ margin: 0 }}>
                            Add New Experience
                        </Title>
                        <Text type="secondary">
                            Create a new work experience entry
                        </Text>
                    </div>
                </div>
            }
        >
            <Form
                form={formInstance}
                layout="vertical"
                onFinish={handleSubmit}
                initialValues={{
                    is_remote: false,
                    is_featured: false,
                    is_published: true,
                    display_order: 0,
                }}
            >
                <Row gutter={24}>
                    <Col xs={24} lg={16}>
                        <Card
                            title="Basic Information"
                            style={{ marginBottom: 24 }}
                        >
                            <Row gutter={16}>
                                <Col span={12}>
                                    <Form.Item
                                        label="Company Name"
                                        name="company_name"
                                        rules={[
                                            {
                                                required: true,
                                                message:
                                                    'Please enter company name',
                                            },
                                        ]}
                                    >
                                        <Input
                                            placeholder="e.g., BINUS IT Division"
                                            size="large"
                                        />
                                    </Form.Item>
                                </Col>
                                <Col span={12}>
                                    <Form.Item
                                        label="Position"
                                        name="position"
                                        rules={[
                                            {
                                                required: true,
                                                message:
                                                    'Please enter position',
                                            },
                                        ]}
                                    >
                                        <Input
                                            placeholder="e.g., Frontend Lead"
                                            size="large"
                                        />
                                    </Form.Item>
                                </Col>
                            </Row>

                            <Row gutter={16}>
                                <Col span={12}>
                                    <Form.Item
                                        label="Employment Type"
                                        name="employment_type"
                                        rules={[
                                            {
                                                required: true,
                                                message: 'Please select type',
                                            },
                                        ]}
                                    >
                                        <Select
                                            placeholder="Select employment type"
                                            size="large"
                                        >
                                            <Select.Option value="full-time">
                                                Full Time
                                            </Select.Option>
                                            <Select.Option value="part-time">
                                                Part Time
                                            </Select.Option>
                                            <Select.Option value="contract">
                                                Contract
                                            </Select.Option>
                                            <Select.Option value="internship">
                                                Internship
                                            </Select.Option>
                                            <Select.Option value="freelance">
                                                Freelance
                                            </Select.Option>
                                        </Select>
                                    </Form.Item>
                                </Col>
                                <Col span={12}>
                                    <Form.Item
                                        label="Location"
                                        name="location"
                                        rules={[
                                            {
                                                required: true,
                                                message:
                                                    'Please enter location',
                                            },
                                        ]}
                                    >
                                        <Input
                                            placeholder="e.g., Jakarta"
                                            size="large"
                                        />
                                    </Form.Item>
                                </Col>
                            </Row>

                            <Row gutter={16}>
                                <Col span={12}>
                                    <Form.Item
                                        label="Start Date"
                                        name="start_date"
                                        rules={[
                                            {
                                                required: true,
                                                message:
                                                    'Please select start date',
                                            },
                                        ]}
                                    >
                                        <DatePicker
                                            style={{ width: '100%' }}
                                            size="large"
                                            format="YYYY-MM-DD"
                                        />
                                    </Form.Item>
                                </Col>
                                <Col span={12}>
                                    <Form.Item
                                        label="End Date (Leave empty if current)"
                                        name="end_date"
                                    >
                                        <DatePicker
                                            style={{ width: '100%' }}
                                            size="large"
                                            format="YYYY-MM-DD"
                                        />
                                    </Form.Item>
                                </Col>
                            </Row>

                            <Form.Item
                                label="Short Description"
                                name="description"
                                rules={[
                                    {
                                        required: true,
                                        message: 'Please enter description',
                                    },
                                    { max: 500, message: 'Max 500 characters' },
                                ]}
                            >
                                <TextArea
                                    rows={3}
                                    placeholder="Brief overview..."
                                    showCount
                                    maxLength={500}
                                />
                            </Form.Item>

                            <Form.Item
                                label="Detailed Description"
                                name="detailed_description"
                            >
                                <TextArea
                                    rows={6}
                                    placeholder="Full description with achievements..."
                                />
                            </Form.Item>
                        </Card>

                        <Card
                            title="Key Achievements"
                            style={{ marginBottom: 24 }}
                        >
                            <Form.List name="key_achievements">
                                {(fields, { add, remove }) => (
                                    <>
                                        {fields.map((field) => (
                                            <Space
                                                key={field.key}
                                                style={{
                                                    display: 'flex',
                                                    marginBottom: 8,
                                                }}
                                                align="baseline"
                                            >
                                                <Form.Item
                                                    {...field}
                                                    style={{
                                                        flex: 1,
                                                        marginBottom: 0,
                                                    }}
                                                >
                                                    <Input
                                                        placeholder="e.g., Led team of 5 developers..."
                                                        size="large"
                                                    />
                                                </Form.Item>
                                                <Button
                                                    type="text"
                                                    danger
                                                    icon={<DeleteOutlined />}
                                                    onClick={() =>
                                                        remove(field.name)
                                                    }
                                                />
                                            </Space>
                                        ))}
                                        <Button
                                            type="dashed"
                                            onClick={() => add()}
                                            block
                                            icon={<PlusOutlined />}
                                        >
                                            Add Achievement
                                        </Button>
                                    </>
                                )}
                            </Form.List>
                        </Card>

                        <Card
                            title="Impact Metrics"
                            style={{ marginBottom: 24 }}
                        >
                            <Form.List name="metrics">
                                {(fields, { add, remove }) => (
                                    <>
                                        {fields.map((field) => (
                                            <Space
                                                key={field.key}
                                                style={{
                                                    display: 'flex',
                                                    marginBottom: 8,
                                                }}
                                                align="baseline"
                                            >
                                                <Form.Item
                                                    {...field}
                                                    style={{
                                                        flex: 1,
                                                        marginBottom: 0,
                                                    }}
                                                >
                                                    <Input
                                                        placeholder="e.g., 10,000+ Users"
                                                        size="large"
                                                    />
                                                </Form.Item>
                                                <Button
                                                    type="text"
                                                    danger
                                                    icon={<DeleteOutlined />}
                                                    onClick={() =>
                                                        remove(field.name)
                                                    }
                                                />
                                            </Space>
                                        ))}
                                        <Button
                                            type="dashed"
                                            onClick={() => add()}
                                            block
                                            icon={<PlusOutlined />}
                                        >
                                            Add Metric
                                        </Button>
                                    </>
                                )}
                            </Form.List>
                        </Card>

                        <Card title="Tech Stack">
                            <Form.List name="tech_stack">
                                {(fields, { add, remove }) => (
                                    <>
                                        {fields.map((field) => (
                                            <Space
                                                key={field.key}
                                                style={{
                                                    display: 'flex',
                                                    marginBottom: 8,
                                                }}
                                                align="baseline"
                                            >
                                                <Form.Item
                                                    {...field}
                                                    style={{
                                                        flex: 1,
                                                        marginBottom: 0,
                                                    }}
                                                >
                                                    <Input
                                                        placeholder="e.g., Laravel"
                                                        size="large"
                                                    />
                                                </Form.Item>
                                                <Button
                                                    type="text"
                                                    danger
                                                    icon={<DeleteOutlined />}
                                                    onClick={() =>
                                                        remove(field.name)
                                                    }
                                                />
                                            </Space>
                                        ))}
                                        <Button
                                            type="dashed"
                                            onClick={() => add()}
                                            block
                                            icon={<PlusOutlined />}
                                        >
                                            Add Technology
                                        </Button>
                                    </>
                                )}
                            </Form.List>
                        </Card>
                    </Col>

                    <Col xs={24} lg={8}>
                        <Card title="Media" style={{ marginBottom: 24 }}>
                            <Form.Item label="Company Logo">
                                <Upload {...logoProps} listType="picture-card">
                                    {!logoFile && (
                                        <div>
                                            <UploadOutlined />
                                            <div style={{ marginTop: 8 }}>
                                                Upload
                                            </div>
                                        </div>
                                    )}
                                </Upload>
                                <Text type="secondary" style={{ fontSize: 12 }}>
                                    Max 2MB • PNG, JPG
                                </Text>
                            </Form.Item>

                            <Form.Item label="Gallery Images">
                                <Upload
                                    {...galleryProps}
                                    listType="picture-card"
                                >
                                    <div>
                                        <UploadOutlined />
                                        <div style={{ marginTop: 8 }}>
                                            Upload
                                        </div>
                                    </div>
                                </Upload>
                                <Text type="secondary" style={{ fontSize: 12 }}>
                                    Max 5MB each • PNG, JPG
                                </Text>
                            </Form.Item>
                        </Card>

                        <Card title="Settings">
                            <Form.Item
                                label="Remote Work"
                                name="is_remote"
                                valuePropName="checked"
                            >
                                <Switch />
                            </Form.Item>
                            <Form.Item
                                label="Featured"
                                name="is_featured"
                                valuePropName="checked"
                            >
                                <Switch />
                            </Form.Item>
                            <Form.Item
                                label="Published"
                                name="is_published"
                                valuePropName="checked"
                            >
                                <Switch defaultChecked />
                            </Form.Item>
                            <Form.Item
                                label="Display Order"
                                name="display_order"
                            >
                                <InputNumber
                                    style={{ width: '100%' }}
                                    min={0}
                                    placeholder="0"
                                />
                            </Form.Item>
                        </Card>
                    </Col>
                </Row>

                <Card>
                    <Space>
                        <Button
                            type="primary"
                            htmlType="submit"
                            icon={<SaveOutlined />}
                            size="large"
                            loading={loading}
                        >
                            Create Experience
                        </Button>
                        <Link href={route('admin.experience.index')}>
                            <Button size="large">Cancel</Button>
                        </Link>
                    </Space>
                </Card>
            </Form>
        </AppLayout>
    );
}
