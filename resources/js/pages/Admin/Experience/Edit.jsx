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
    Image,
} from 'antd';
import dayjs from 'dayjs';
import { useState } from 'react';
import AppLayout from '../../../layouts/app-layout';
 
const { Title, Text } = Typography;
const { TextArea } = Input;

export default function ExperienceEdit({ experience }) {
    const [formInstance] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [logoFile, setLogoFile] = useState(null);
    const [galleryFiles, setGalleryFiles] = useState([]);

    const handleSubmit = (values) => {
        setLoading(true);
        const formData = new FormData();
        
        formData.append('_method', 'PUT');
        formData.append('company_name', values.company_name);
        formData.append('position', values.position);
        formData.append('employment_type', values.employment_type);
        formData.append('location', values.location);
        formData.append('is_remote', values.is_remote ? 1 : 0);
        formData.append('description', values.description);
        formData.append('is_featured', values.is_featured ? 1 : 0);
        formData.append('is_published', values.is_published ? 1 : 0);
        formData.append('start_date', values.start_date.format('YYYY-MM-DD'));
        
        if (values.end_date) formData.append('end_date', values.end_date.format('YYYY-MM-DD'));
        if (values.detailed_description) formData.append('detailed_description', values.detailed_description);
        if (values.display_order !== undefined) formData.append('display_order', values.display_order);
        
        // ✅ FIX: Same fix for Edit
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
    
        router.post(route('admin.experience.update', experience.id), formData, {
            forceFormData: true,
            onSuccess: () => {
                setLoading(false);
                message.success('Experience updated successfully!');
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
                message.error('Only image files allowed!');
                return false;
            }
            if (file.size / 1024 / 1024 >= 2) {
                message.error('Max 2MB!');
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
                message.error('Only image files allowed!');
                return false;
            }
            if (file.size / 1024 / 1024 >= 5) {
                message.error('Max 5MB!');
                return false;
            }
            setGalleryFiles(prev => [...prev, file]);
            return false;
        },
        onRemove: (file) => setGalleryFiles(prev => prev.filter(f => f.uid !== file.uid)),
        fileList: galleryFiles,
        multiple: true,
    };

    return (
        <AppLayout header={
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <Link href={route('admin.experience.index')}>
                    <Button icon={<ArrowLeftOutlined />}>Back</Button>
                </Link>
                <div>
                    <Title level={2} style={{ margin: 0 }}>Edit Experience</Title>
                    <Text type="secondary">{experience.company_name} - {experience.position}</Text>
                </div>
            </div>
        }>
            <Form
                form={formInstance}
                layout="vertical"
                onFinish={handleSubmit}
                initialValues={{
                    company_name: experience.company_name,
                    position: experience.position,
                    employment_type: experience.employment_type,
                    location: experience.location,
                    is_remote: experience.is_remote,
                    description: experience.description,
                    detailed_description: experience.detailed_description,
                    start_date: dayjs(experience.start_date),
                    end_date: experience.end_date ? dayjs(experience.end_date) : null,
                    key_achievements: experience.key_achievements || [],
                    metrics: experience.metrics || [],
                    tech_stack: experience.tech_stack || [],
                    is_featured: experience.is_featured,
                    is_published: experience.is_published,
                    display_order: experience.display_order,
                }}
            >
                <Row gutter={24}>
                    <Col xs={24} lg={16}>
                        <Card title="Basic Information" style={{ marginBottom: 24 }}>
                            <Row gutter={16}>
                                <Col span={12}>
                                    <Form.Item label="Company Name" name="company_name" rules={[{ required: true, message: 'Required' }]}>
                                        <Input placeholder="e.g., BINUS IT Division" size="large" />
                                    </Form.Item>
                                </Col>
                                <Col span={12}>
                                    <Form.Item label="Position" name="position" rules={[{ required: true, message: 'Required' }]}>
                                        <Input placeholder="e.g., Frontend Lead" size="large" />
                                    </Form.Item>
                                </Col>
                            </Row>

                            <Row gutter={16}>
                                <Col span={12}>
                                    <Form.Item label="Employment Type" name="employment_type" rules={[{ required: true }]}>
                                        <Select placeholder="Select type" size="large">
                                            <Select.Option value="full-time">Full Time</Select.Option>
                                            <Select.Option value="part-time">Part Time</Select.Option>
                                            <Select.Option value="contract">Contract</Select.Option>
                                            <Select.Option value="internship">Internship</Select.Option>
                                            <Select.Option value="freelance">Freelance</Select.Option>
                                        </Select>
                                    </Form.Item>
                                </Col>
                                <Col span={12}>
                                    <Form.Item label="Location" name="location" rules={[{ required: true }]}>
                                        <Input placeholder="e.g., Jakarta" size="large" />
                                    </Form.Item>
                                </Col>
                            </Row>

                            <Row gutter={16}>
                                <Col span={12}>
                                    <Form.Item label="Start Date" name="start_date" rules={[{ required: true }]}>
                                        <DatePicker style={{ width: '100%' }} size="large" format="YYYY-MM-DD" />
                                    </Form.Item>
                                </Col>
                                <Col span={12}>
                                    <Form.Item label="End Date (Leave empty if current)" name="end_date">
                                        <DatePicker style={{ width: '100%' }} size="large" format="YYYY-MM-DD" />
                                    </Form.Item>
                                </Col>
                            </Row>

                            <Form.Item label="Short Description" name="description" rules={[{ required: true }, { max: 500 }]}>
                                <TextArea rows={3} placeholder="Brief overview..." showCount maxLength={500} />
                            </Form.Item>

                            <Form.Item label="Detailed Description" name="detailed_description">
                                <TextArea rows={6} placeholder="Full description with achievements..." />
                            </Form.Item>
                        </Card>

                        <Card title="Key Achievements" style={{ marginBottom: 24 }}>
                            <Form.List name="key_achievements">
                                {(fields, { add, remove }) => (
                                    <>
                                        {fields.map((field, index) => (
                                            <Space key={field.key} style={{ display: 'flex', marginBottom: 8 }} align="baseline">
                                                <Form.Item {...field} style={{ flex: 1, marginBottom: 0 }}>
                                                    <Input placeholder="e.g., Led team of 5 developers..." size="large" />
                                                </Form.Item>
                                                <Button type="text" danger icon={<DeleteOutlined />} onClick={() => remove(field.name)} />
                                            </Space>
                                        ))}
                                        <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                                            Add Achievement
                                        </Button>
                                    </>
                                )}
                            </Form.List>
                        </Card>

                        <Card title="Impact Metrics" style={{ marginBottom: 24 }}>
                            <Form.List name="metrics">
                                {(fields, { add, remove }) => (
                                    <>
                                        {fields.map((field) => (
                                            <Space key={field.key} style={{ display: 'flex', marginBottom: 8 }} align="baseline">
                                                <Form.Item {...field} style={{ flex: 1, marginBottom: 0 }}>
                                                    <Input placeholder="e.g., 10,000+ Users" size="large" />
                                                </Form.Item>
                                                <Button type="text" danger icon={<DeleteOutlined />} onClick={() => remove(field.name)} />
                                            </Space>
                                        ))}
                                        <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
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
                                            <Space key={field.key} style={{ display: 'flex', marginBottom: 8 }} align="baseline">
                                                <Form.Item {...field} style={{ flex: 1, marginBottom: 0 }}>
                                                    <Input placeholder="e.g., Laravel" size="large" />
                                                </Form.Item>
                                                <Button type="text" danger icon={<DeleteOutlined />} onClick={() => remove(field.name)} />
                                            </Space>
                                        ))}
                                        <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                                            Add Technology
                                        </Button>
                                    </>
                                )}
                            </Form.List>
                        </Card>
                    </Col>

                    <Col xs={24} lg={8}>
                        <Card title="Media" style={{ marginBottom: 24 }}>
                            {experience.company_logo && (
                                <div style={{ marginBottom: 16 }}>
                                    <Text type="secondary" style={{ display: 'block', marginBottom: 8 }}>
                                        Current Logo:
                                    </Text>
                                    <Image
                                        src={`/storage/${experience.company_logo}`}
                                        alt="Company Logo"
                                        style={{ maxWidth: '100%', borderRadius: 8 }}
                                        preview={false}
                                    />
                                </div>
                            )}
                            
                            <Form.Item label="Replace Logo">
                                <Upload {...logoProps} listType="picture-card">
                                    {!logoFile && (
                                        <div>
                                            <UploadOutlined />
                                            <div style={{ marginTop: 8 }}>Upload New</div>
                                        </div>
                                    )}
                                </Upload>
                                <Text type="secondary" style={{ fontSize: 12 }}>Max 2MB</Text>
                            </Form.Item>

                            {experience.gallery && experience.gallery.length > 0 && (
                                <div style={{ marginBottom: 16 }}>
                                    <Text type="secondary" style={{ display: 'block', marginBottom: 8 }}>
                                        Current Gallery ({experience.gallery.length} images):
                                    </Text>
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
                                        {experience.gallery.map((img, idx) => (
                                            <Image
                                                key={idx}
                                                src={`/storage/${img}`}
                                                alt={`Gallery ${idx + 1}`}
                                                style={{ width: '100%', borderRadius: 4 }}
                                            />
                                        ))}
                                    </div>
                                </div>
                            )}

                            <Form.Item label="Add More Gallery Images">
                                <Upload {...galleryProps} listType="picture-card">
                                    <div>
                                        <UploadOutlined />
                                        <div style={{ marginTop: 8 }}>Upload</div>
                                    </div>
                                </Upload>
                                <Text type="secondary" style={{ fontSize: 12 }}>Max 5MB each</Text>
                            </Form.Item>
                        </Card>

                        <Card title="Settings">
                            <Form.Item label="Remote Work" name="is_remote" valuePropName="checked">
                                <Switch />
                            </Form.Item>
                            <Form.Item label="Featured" name="is_featured" valuePropName="checked">
                                <Switch />
                            </Form.Item>
                            <Form.Item label="Published" name="is_published" valuePropName="checked">
                                <Switch />
                            </Form.Item>
                            <Form.Item label="Display Order" name="display_order">
                                <InputNumber style={{ width: '100%' }} min={0} placeholder="0" />
                            </Form.Item>
                        </Card>
                    </Col>
                </Row>

                <Card>
                    <Space>
                        <Button type="primary" htmlType="submit" icon={<SaveOutlined />} size="large" loading={loading}>
                            Update Experience
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