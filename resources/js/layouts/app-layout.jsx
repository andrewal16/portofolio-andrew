import {
    FileTextOutlined,
    LogoutOutlined,
    MenuFoldOutlined,
    MenuUnfoldOutlined,
    ProjectOutlined,
    RocketOutlined,
    SafetyCertificateOutlined,
    SettingOutlined,
    UserOutlined,
} from '@ant-design/icons';
import { Link, router, usePage } from '@inertiajs/react';
import {
    Avatar,
    Breadcrumb,
    Button,
    Dropdown,
    Layout,
    Menu,
    Space,
    Typography,
    theme,
} from 'antd';
import { useState } from 'react';
import { route } from 'ziggy-js';

const { Header, Sider, Content } = Layout;
const { Text, Title } = Typography;

export default function AppLayout({ children, header }) {
    const { auth, url } = usePage().props;
    const [collapsed, setCollapsed] = useState(false);

    const {
        token: { colorBgContainer, borderRadiusLG },
    } = theme.useToken();

    // ✅ Menu items configuration (UPDATED with Experience)
    const menuItems = [
        {
            key: 'admin.project.index',
            icon: <ProjectOutlined />,
            label: <Link href={route('admin.project.index')}>Projects</Link>,
            title: 'Projects',
        },
        {
            key: 'admin.experience.index',
            icon: <RocketOutlined />,
            label: (
                <Link href={route('admin.experience.index')}>Experience</Link>
            ),
            title: 'Experience',
        },
        {
            key: 'admin.certificate.index',
            icon: <SafetyCertificateOutlined />,
            label: (
                <Link href={route('admin.certificate.index')}>
                    Certificates
                </Link>
            ),
            title: 'Certificates',
        },
        {
            key: 'admin.blog-posts.index',
            icon: <FileTextOutlined />,
            label: (
                <Link href={route('admin.blog-posts.index')}>Mini Blog</Link>
            ),
            title: 'Blog Posts',
        },
    ];

    // ✅ Logout handler menggunakan Inertia way
    const handleLogout = () => {
        router.post(
            route('logout'),
            {},
            {
                preserveScroll: true,
                onSuccess: () => {
                    // Fortify akan auto-redirect ke login page
                },
            },
        );
    };

    // User dropdown menu
    const userMenuItems = [
        {
            key: 'profile',
            icon: <UserOutlined />,
            label: <Link href="/profile">Profile Settings</Link>,
        },
        {
            key: 'settings',
            icon: <SettingOutlined />,
            label: <Link href="/settings">Account Settings</Link>,
        },
        {
            type: 'divider',
        },
        {
            key: 'logout',
            icon: <LogoutOutlined />,
            label: 'Logout',
            danger: true,
            onClick: handleLogout,
        },
    ];

    // ✅ Get current active menu key (UPDATED with Experience)
    const getCurrentMenuKey = () => {
        try {
            const currentRoute = route().current();

            if (currentRoute) {
                if (currentRoute.startsWith('admin.experience')) {
                    return 'admin.experience.index';
                }
                if (currentRoute.startsWith('admin.certificate')) {
                    return 'admin.certificate.index';
                }
                if (currentRoute.startsWith('admin.project')) {
                    return 'admin.project.index';
                }
                if (currentRoute.startsWith('admin.blog-posts')) {
                    return 'admin.blog-posts.index';
                }
            }
        } catch (e) {
            console.log('⚠️ Ziggy route checking failed:', e.message);
        }

        if (!url) {
            return 'admin.project.index';
        }

        const normalizedUrl = url.replace(/\/$/, '').toLowerCase();

        if (normalizedUrl.match(/\/admin\/experience/)) {
            return 'admin.experience.index';
        }

        if (normalizedUrl.match(/\/admin\/certificate/)) {
            return 'admin.certificate.index';
        }

        if (normalizedUrl.match(/\/admin\/project/)) {
            return 'admin.project.index';
        }

        if (normalizedUrl.match(/\/admin\/blog-posts/)) {
            return 'admin.blog-posts.index';
        }

        return 'admin.project.index';
    };

    // ✅ Generate breadcrumb dari URL (UPDATED with Experience)
    const getBreadcrumbItems = () => {
        const items = [];

        if (!url) return items;

        const segments = url.split('/').filter(Boolean);

        if (segments.length > 1) {
            const section = segments[1];

            let sectionLabel = section;
            if (section === 'blog-posts') {
                sectionLabel = 'Blog Posts';
            } else if (section === 'experience') {
                sectionLabel = 'Experience';
            } else {
                sectionLabel =
                    section.charAt(0).toUpperCase() + section.slice(1);
            }

            items.push({
                title: <Link href={`/admin/${section}`}>{sectionLabel}</Link>,
            });

            if (segments.length > 2) {
                const action = segments[2];

                if (action === 'create' || action === 'edit') {
                    items.push({
                        title: action.charAt(0).toUpperCase() + action.slice(1),
                    });
                } else if (!isNaN(action)) {
                    items.push({
                        title: 'Edit',
                    });
                } else {
                    items.push({
                        title: 'Edit',
                    });
                }
            }
        }

        return items;
    };

    return (
        <Layout style={{ minHeight: '100vh' }}>
            {/* Sidebar */}
            <Sider
                trigger={null}
                collapsible
                collapsed={collapsed}
                breakpoint="lg"
                onBreakpoint={(broken) => {
                    if (broken) setCollapsed(true);
                }}
                style={{
                    overflow: 'auto',
                    height: '100vh',
                    position: 'fixed',
                    left: 0,
                    top: 0,
                    bottom: 0,
                }}
            >
                {/* Logo */}
                <div
                    style={{
                        height: 64,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                    }}
                >
                    <Link href="/admin">
                        <Text
                            strong
                            style={{
                                color: '#fff',
                                fontSize: collapsed ? 16 : 20,
                                transition: 'all 0.2s',
                            }}
                        >
                            {collapsed ? 'AD' : 'Admin Panel'}
                        </Text>
                    </Link>
                </div>

                {/* Menu */}
                <Menu
                    theme="dark"
                    mode="inline"
                    selectedKeys={[getCurrentMenuKey()]}
                    items={menuItems}
                    style={{ marginTop: 16 }}
                />
            </Sider>

            {/* Main Layout */}
            <Layout
                style={{
                    marginLeft: collapsed ? 80 : 200,
                    transition: 'all 0.2s',
                }}
            >
                {/* Header */}
                <Header
                    style={{
                        padding: '0 24px',
                        background: colorBgContainer,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        position: 'sticky',
                        top: 0,
                        zIndex: 1,
                        boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                    }}
                >
                    {/* Toggle Button */}
                    <Button
                        type="text"
                        icon={
                            collapsed ? (
                                <MenuUnfoldOutlined />
                            ) : (
                                <MenuFoldOutlined />
                            )
                        }
                        onClick={() => setCollapsed(!collapsed)}
                        style={{
                            fontSize: '16px',
                            width: 64,
                            height: 64,
                        }}
                    />

                    {/* User Menu */}
                    <Dropdown
                        menu={{ items: userMenuItems }}
                        placement="bottomRight"
                        trigger={['click']}
                    >
                        <Space
                            style={{
                                cursor: 'pointer',
                                padding: '8px 12px',
                                borderRadius: 8,
                            }}
                        >
                            <Avatar
                                style={{
                                    backgroundColor: '#1890ff',
                                }}
                                icon={<UserOutlined />}
                            >
                                {auth?.user?.name?.charAt(0).toUpperCase()}
                            </Avatar>
                            <Text strong>{auth?.user?.name || 'Admin'}</Text>
                        </Space>
                    </Dropdown>
                </Header>

                {/* Content */}
                <Content
                    style={{
                        margin: '24px',
                        minHeight: 280,
                    }}
                >
                    <div
                        style={{
                            padding: 24,
                            background: colorBgContainer,
                            borderRadius: borderRadiusLG,
                            minHeight: 'calc(100vh - 112px)',
                        }}
                    >
                        {/* Breadcrumb */}
                        {getBreadcrumbItems().length > 0 && (
                            <Breadcrumb
                                items={getBreadcrumbItems()}
                                style={{ marginBottom: 16 }}
                            />
                        )}

                        {/* Custom Header Section */}
                        {header && (
                            <div style={{ marginBottom: 24 }}>
                                {typeof header === 'string' ? (
                                    <Title level={2} style={{ margin: 0 }}>
                                        {header}
                                    </Title>
                                ) : (
                                    header
                                )}
                            </div>
                        )}

                        {/* Page Content */}
                        {children}
                    </div>
                </Content>
            </Layout>
        </Layout>
    );
}
