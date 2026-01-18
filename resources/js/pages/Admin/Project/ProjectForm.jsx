import {
    AppstoreOutlined,
    ArrowLeftOutlined,
    CloudUploadOutlined,
    DeleteOutlined,
    GithubOutlined,
    GlobalOutlined,
    LinkOutlined,
    SaveOutlined,
    TagsOutlined,
} from '@ant-design/icons';
import { router, useForm, usePage } from '@inertiajs/react';
import {
    Button,
    Card,
    Col,
    DatePicker,
    Divider,
    Form,
    Input,
    message,
    Row,
    Select,
    Space,
    Tag,
    Typography,
    Upload,
} from 'antd';
import dayjs from 'dayjs';
import { useEffect, useState } from 'react';
import { route } from 'ziggy-js';
import AppLayout from '../../../layouts/app-layout';

const { TextArea } = Input;
const { Dragger } = Upload;
const { Title, Text } = Typography;

// ✅ POPULAR TECHNOLOGIES
const POPULAR_TECH = [
    'React',
    'Vue.js',
    'Angular',
    'Next.js',
    'Nuxt.js',
    'Laravel',
    'Node.js',
    'Express',
    'NestJS',
    'Django',
    'PHP',
    'Python',
    'JavaScript',
    'TypeScript',
    'Java',
    'MySQL',
    'PostgreSQL',
    'MongoDB',
    'Redis',
    'Firebase',
    'Docker',
    'Kubernetes',
    'AWS',
    'Azure',
    'Google Cloud',
    'Tailwind CSS',
    'Bootstrap',
    'Material-UI',
    'Ant Design',
    'Git',
    'GitHub',
    'GitLab',
    'CI/CD',
    'REST API',
    'GraphQL',
];

// ✅ PREDEFINED PROJECT TYPES
const PROJECT_TYPES = [
    { value: 'Web App', label: 'Web Application', color: 'blue' },
    { value: 'Mobile', label: 'Mobile App', color: 'green' },
    { value: 'Data Science', label: 'Data Science', color: 'purple' },
    { value: 'AI', label: 'AI / Machine Learning', color: 'magenta' },
    { value: 'Desktop', label: 'Desktop App', color: 'cyan' },
    { value: 'API', label: 'API / Backend', color: 'orange' },
    { value: 'Game', label: 'Game Development', color: 'red' },
    { value: 'IoT', label: 'IoT / Embedded', color: 'geekblue' },
];

const techColors = {
    React: 'blue',
    'Vue.js': 'green',
    Laravel: 'red',
    'Node.js': 'green',
    TypeScript: 'blue',
    PHP: 'purple',
    Python: 'yellow',
    MySQL: 'orange',
    Docker: 'cyan',
    AWS: 'orange',
};

function ProjectForm() {
    const { typeForm, project, availableTypes, errors, flash } =
        usePage().props;
    const [form] = Form.useForm();
    const [thumbnailFile, setThumbnailFile] = useState(null);
    const [thumbnailPreview, setThumbnailPreview] = useState(
        project?.thumbnail_url || null,
    );

    const { data, setData, processing } = useForm({
        title: project?.title || '',
        slug: project?.slug || '',
        excerpt: project?.excerpt || '',
        thumbnail: null,
        demo_url: project?.demo_url || '',
        repo_url: project?.repo_url || '',
        started_at: project?.started_at || null,
        finished_at: project?.finished_at || null,
        status: project?.status || 'ongoing',
        type: project?.type || '',
        technologies: [],
    });

    useEffect(() => {
        if (typeForm === 'edit' && project) {
            let fixedTechnologies = [];
            if (Array.isArray(project.technologies)) {
                fixedTechnologies = project.technologies;
            } else if (typeof project.technologies === 'string') {
                try {
                    fixedTechnologies = JSON.parse(project.technologies);
                    if (typeof fixedTechnologies === 'string') {
                        fixedTechnologies = JSON.parse(fixedTechnologies);
                    }
                } catch (e) {
                    fixedTechnologies = [];
                }
            }

            form.setFieldsValue({
                ...project,
                started_at: project.started_at
                    ? dayjs(project.started_at)
                    : null,
                finished_at: project.finished_at
                    ? dayjs(project.finished_at)
                    : null,
                technologies: fixedTechnologies,
            });

            setThumbnailPreview(project.thumbnail_url);
        }
    }, [typeForm, project, form]);

    useEffect(() => {
        if (flash?.success) message.success(flash.success);
        if (errors && Object.keys(errors).length > 0) {
            message.error('Please check your inputs.');
            const formErrors = Object.keys(errors).map((key) => ({
                name: key,
                errors: [errors[key]],
            }));
            form.setFields(formErrors);
        }
    }, [flash, errors, form]);

    const handleValuesChange = (changedValues) => {
        Object.keys(changedValues).forEach((key) => {
            setData(key, changedValues[key]);
        });
    };

    const handleThumbnailChange = (info) => {
        const file = info.file.originFileObj || info.file;
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (e) => setThumbnailPreview(e.target.result);
        reader.readAsDataURL(file);
        setThumbnailFile(file);
        setData('thumbnail', file);
    };

    const handleRemoveThumbnail = (e) => {
        e.stopPropagation();
        setThumbnailFile(null);
        setThumbnailPreview(null);
        setData('thumbnail', null);
    };

    const handleTitleChange = (e) => {
        const value = e.target.value;
        if (typeForm === 'create' || !form.getFieldValue('slug')) {
            const slug = value
                .toLowerCase()
                .replace(/ /g, '-')
                .replace(/[^\w-]+/g, '');
            form.setFieldsValue({ slug });
            setData('slug', slug);
        }
    };

    const handleSubmit = (values) => {
        const formData = new FormData();

        Object.keys(values).forEach((key) => {
            if (key === 'started_at' || key === 'finished_at') {
                if (values[key]) {
                    formData.append(
                        key,
                        dayjs(values[key]).format('YYYY-MM-DD'),
                    );
                }
            } else if (key === 'technologies') {
                const techArray = values[key] || [];
                formData.append(key, JSON.stringify(techArray));
            } else if (values[key] !== undefined && values[key] !== null) {
                formData.append(key, values[key]);
            }
        });

        if (thumbnailFile) {
            formData.append('thumbnail', thumbnailFile);
        }

        const options = {
            forceFormData: true,
            onSuccess: () => {
                if (typeForm === 'create') form.resetFields();
            },
        };

        if (typeForm === 'create') {
            router.post(route('admin.project.store'), formData, options);
        } else {
            formData.append('_method', 'PUT');
            router.post(
                route('admin.project.update', project.slug),
                formData,
                options,
            );
        }
    };

    // ✅ Combine predefined types with existing custom types
    const allTypeOptions = [
        ...PROJECT_TYPES,
        ...(availableTypes || [])
            .filter((t) => !PROJECT_TYPES.find((pt) => pt.value === t))
            .map((t) => ({ value: t, label: t, color: 'default' })),
    ];

    return (
        <AppLayout
            header={typeForm === 'create' ? 'Create Project' : 'Edit Project'}
        >
            <Form
                form={form}
                layout="vertical"
                onFinish={handleSubmit}
                onValuesChange={handleValuesChange}
                initialValues={{ status: 'ongoing', technologies: [] }}
                requiredMark="optional"
            >
                {/* Header Actions */}
                <div className="mb-6 flex items-center justify-between">
                    <Button
                        icon={<ArrowLeftOutlined />}
                        onClick={() =>
                            router.visit(route('admin.project.index'))
                        }
                    >
                        Back
                    </Button>
                    <Button
                        type="primary"
                        htmlType="submit"
                        icon={<SaveOutlined />}
                        loading={processing}
                        size="large"
                    >
                        {typeForm === 'create'
                            ? 'Publish Project'
                            : 'Save Changes'}
                    </Button>
                </div>

                <Row gutter={24} align="top" className="!pb-3">
                    <Col xs={24} lg={16}>
                        <Card className="!mb-6 shadow-sm" bordered={false}>
                            <Title level={5} className="mb-4">
                                Project Details
                            </Title>

                            <Form.Item
                                label="Title"
                                name="title"
                                rules={[
                                    { required: true, message: 'Required' },
                                ]}
                            >
                                <Input
                                    size="large"
                                    placeholder="Enter project name"
                                    onChange={handleTitleChange}
                                />
                            </Form.Item>

                            <Form.Item
                                label="Slug"
                                name="slug"
                                extra="URL friendly name (auto-generated)"
                            >
                                <Input
                                    prefix={
                                        <LinkOutlined className="text-gray-300" />
                                    }
                                />
                            </Form.Item>

                            <Form.Item
                                label="Description / Excerpt"
                                name="excerpt"
                                rules={[
                                    { required: true, message: 'Required' },
                                ]}
                            >
                                <TextArea
                                    rows={6}
                                    placeholder="Tell the story about this project..."
                                    showCount
                                    maxLength={500}
                                />
                            </Form.Item>

                            {/* ✅ PROJECT TYPE - IMPROVED */}
                            <Form.Item
                                label={
                                    <Space>
                                        <AppstoreOutlined />
                                        <span>Project Type</span>
                                    </Space>
                                }
                                name="type"
                                extra="Select or type a custom category for filtering"
                            >
                                <Select
                                    size="large"
                                    placeholder="Select or enter project type"
                                    mode="tags"
                                    maxCount={1}
                                    tokenSeparators={[',']}
                                    style={{ width: '100%' }}
                                    onChange={(values) => {
                                        // Only keep the last selected value
                                        const value =
                                            values.length > 0
                                                ? values[values.length - 1]
                                                : '';
                                        form.setFieldValue('type', value);
                                    }}
                                    value={
                                        form.getFieldValue('type')
                                            ? [form.getFieldValue('type')]
                                            : []
                                    }
                                >
                                    {allTypeOptions.map((opt) => (
                                        <Select.Option
                                            key={opt.value}
                                            value={opt.value}
                                        >
                                            <Tag color={opt.color}>
                                                {opt.label}
                                            </Tag>
                                        </Select.Option>
                                    ))}
                                </Select>
                            </Form.Item>

                            {/* Technologies */}
                            <Form.Item
                                label={
                                    <Space>
                                        <TagsOutlined />
                                        <span>Technologies Used</span>
                                    </Space>
                                }
                                name="technologies"
                            >
                                <Select
                                    mode="tags"
                                    size="large"
                                    placeholder="e.g., React, Laravel..."
                                    style={{ width: '100%' }}
                                    tokenSeparators={[',']}
                                    options={POPULAR_TECH.map((t) => ({
                                        label: t,
                                        value: t,
                                    }))}
                                    tagRender={(props) => (
                                        <Tag
                                            color={
                                                techColors[props.value] ||
                                                'blue'
                                            }
                                            closable={props.closable}
                                            onClose={props.onClose}
                                            style={{ marginRight: 3 }}
                                        >
                                            {props.label}
                                        </Tag>
                                    )}
                                />
                            </Form.Item>
                        </Card>

                        <Card
                            className="shadow-sm"
                            bordered={false}
                            title="External Links"
                        >
                            <Row gutter={16}>
                                <Col span={12}>
                                    <Form.Item label="Demo URL" name="demo_url">
                                        <Input
                                            prefix={
                                                <GlobalOutlined className="text-gray-400" />
                                            }
                                            placeholder="https://..."
                                        />
                                    </Form.Item>
                                </Col>
                                <Col span={12}>
                                    <Form.Item
                                        label="Repository URL"
                                        name="repo_url"
                                    >
                                        <Input
                                            prefix={
                                                <GithubOutlined className="text-gray-400" />
                                            }
                                            placeholder="https://github.com/..."
                                        />
                                    </Form.Item>
                                </Col>
                            </Row>
                        </Card>
                    </Col>

                    {/* Sidebar */}
                    <Col xs={24} lg={8}>
                        <Card
                            className="!mb-6 shadow-sm"
                            bordered={false}
                            title="Thumbnail"
                        >
                            <Form.Item name="thumbnail" noStyle>
                                <Dragger
                                    name="thumbnail"
                                    multiple={false}
                                    showUploadList={false}
                                    beforeUpload={() => false}
                                    onChange={handleThumbnailChange}
                                    accept="image/png, image/jpeg, image/jpg, image/webp"
                                    style={{
                                        padding: '0px',
                                        overflow: 'hidden',
                                    }}
                                >
                                    {thumbnailPreview ? (
                                        <div className="group relative flex h-64 w-full items-center justify-center overflow-hidden bg-gray-100">
                                            <img
                                                src={thumbnailPreview}
                                                alt="thumbnail"
                                                className="h-full w-full object-cover"
                                            />
                                            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
                                                <CloudUploadOutlined className="mb-2 text-3xl text-white" />
                                                <Text className="text-white">
                                                    Click to Change
                                                </Text>
                                                <Button
                                                    type="text"
                                                    danger
                                                    icon={<DeleteOutlined />}
                                                    className="mt-4 bg-white/10 text-white"
                                                    onClick={
                                                        handleRemoveThumbnail
                                                    }
                                                >
                                                    Remove
                                                </Button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="px-4 py-12">
                                            <p className="ant-upload-drag-icon">
                                                <CloudUploadOutlined
                                                    style={{ color: '#4096ff' }}
                                                />
                                            </p>
                                            <p className="ant-upload-text">
                                                Click or drag file to upload
                                            </p>
                                            <p className="ant-upload-hint text-xs text-gray-400">
                                                Recommended: 1200x630px, Max 2MB
                                            </p>
                                        </div>
                                    )}
                                </Dragger>
                            </Form.Item>
                        </Card>

                        <Card
                            className="!mb-6 shadow-sm"
                            bordered={false}
                            title="Publishing"
                        >
                            <Form.Item
                                label="Status"
                                name="status"
                                rules={[{ required: true }]}
                            >
                                <Select
                                    options={[
                                        {
                                            value: 'ongoing',
                                            label: (
                                                <Space>
                                                    <div className="h-2 w-2 rounded-full bg-blue-500" />
                                                    Ongoing
                                                </Space>
                                            ),
                                        },
                                        {
                                            value: 'completed',
                                            label: (
                                                <Space>
                                                    <div className="h-2 w-2 rounded-full bg-green-500" />
                                                    Completed
                                                </Space>
                                            ),
                                        },
                                        {
                                            value: 'upcoming',
                                            label: (
                                                <Space>
                                                    <div className="h-2 w-2 rounded-full bg-orange-500" />
                                                    Upcoming
                                                </Space>
                                            ),
                                        },
                                    ]}
                                />
                            </Form.Item>

                            <Divider style={{ margin: '12px 0' }} />

                            <Form.Item
                                label="Timeline"
                                style={{ marginBottom: 0 }}
                            >
                                <Space direction="vertical" className="w-full">
                                    <Form.Item
                                        name="started_at"
                                        style={{ marginBottom: 8 }}
                                    >
                                        <DatePicker
                                            className="w-full"
                                            placeholder="Start Date"
                                        />
                                    </Form.Item>
                                    <Form.Item
                                        name="finished_at"
                                        style={{ marginBottom: 0 }}
                                    >
                                        <DatePicker
                                            className="w-full"
                                            placeholder="Finish Date (Optional)"
                                        />
                                    </Form.Item>
                                </Space>
                            </Form.Item>
                        </Card>
                    </Col>
                </Row>
            </Form>
        </AppLayout>
    );
}

export default ProjectForm;
