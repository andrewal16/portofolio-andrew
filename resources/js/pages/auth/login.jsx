import { LockOutlined, MailOutlined } from '@ant-design/icons';
import { router, usePage } from '@inertiajs/react';
import {
    Alert,
    Button,
    Card,
    Checkbox,
    Form,
    Input,
    message,
    Typography,
} from 'antd';
import React, { useEffect } from 'react';
import { route } from 'ziggy-js';

const { Title, Text } = Typography;

function Login() {
    const [form] = Form.useForm();
    const { errors, flash, status } = usePage().props;
    // const [isLoading, setIsLoading] = React.useState(false);

    // ✅ Handle Flash Messages (success, error, info)
    useEffect(() => {
        if (flash?.success) {
            message.success(flash.success);
        }
        if (flash?.error) {
            message.error(flash.error);
        }
        if (flash?.info) {
            message.info(flash.info);
        }
    }, [flash]);

    // ✅ Handle Laravel validation errors
    useEffect(() => {
        if (errors && Object.keys(errors).length > 0) {
            message.error('Email atau password salah');

            // Set errors ke form Ant Design
            const formErrors = Object.keys(errors).map((key) => ({
                name: key,
                errors: [errors[key]],
            }));
            form.setFields(formErrors);
        }
    }, [errors, form]);

    const [isLoading, setIsLoading] = React.useState(false);

    const handleSubmit = (values) => {
        setIsLoading(true);

        // ✅ Inertia way: POST langsung tanpa axios
        router.post(route('login'), values, {
            preserveScroll: true,
            onSuccess: () => {
                message.success('Login berhasil!');
                // Fortify akan auto-redirect ke admin dashboard
            },
            onError: () => {
                message.error(
                    'Login gagal, periksa kembali email dan password Anda',
                );
            },
            onFinish: () => {
                setIsLoading(false);
            },
        });
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
            <Card className="w-full max-w-md shadow-2xl" bordered={false}>
                {/* Header */}
                <div className="mb-8 text-center">
                    <div className="mb-4 flex justify-center">
                        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-500">
                            <LockOutlined className="text-3xl text-white" />
                        </div>
                    </div>
                    <Title level={2} className="!mb-2">
                        Admin Login
                    </Title>
                    <Text type="secondary">
                        Masukkan kredensial Anda untuk melanjutkan
                    </Text>
                </div>

                {/* Form */}
                <Form
                    form={form}
                    name="login"
                    onFinish={handleSubmit}
                    layout="vertical"
                    size="large"
                    requiredMark={false}
                >
                    {/* ✅ Session Status (e.g., "Password reset successful") */}
                    {status && (
                        <Alert
                            message={status}
                            type="success"
                            showIcon
                            closable
                            style={{ marginBottom: 24 }}
                        />
                    )}
                    {/* Email */}
                    <Form.Item
                        name="email"
                        label="Email"
                        rules={[
                            { required: true, message: 'Email wajib diisi' },
                            {
                                type: 'email',
                                message: 'Format email tidak valid',
                            },
                        ]}
                    >
                        <Input
                            prefix={<MailOutlined className="text-gray-400" />}
                            placeholder="admin@example.com"
                            autoComplete="email"
                        />
                    </Form.Item>

                    {/* Password */}
                    <Form.Item
                        name="password"
                        label="Password"
                        rules={[
                            { required: true, message: 'Password wajib diisi' },
                        ]}
                    >
                        <Input.Password
                            prefix={<LockOutlined className="text-gray-400" />}
                            placeholder="••••••••"
                            autoComplete="current-password"
                        />
                    </Form.Item>

                    {/* Remember Me */}
                    <Form.Item name="remember" valuePropName="checked">
                        <Checkbox>Ingat saya</Checkbox>
                    </Form.Item>

                    {/* Submit Button */}
                    <Form.Item>
                        <Button
                            type="primary"
                            htmlType="submit"
                            loading={isLoading}
                            block
                            size="large"
                            className="!h-12 !text-base font-semibold"
                        >
                            {isLoading ? 'Memproses...' : 'Login'}
                        </Button>
                    </Form.Item>
                </Form>

                {/* Footer */}
                <div className="mt-6 text-center">
                    <Text type="secondary" className="text-sm">
                        © 2024 Portfolio Admin. All rights reserved.
                    </Text>
                </div>
            </Card>
        </div>
    );
}

export default Login;
