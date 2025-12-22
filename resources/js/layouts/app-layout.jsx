import {
    FileTextOutlined,
    LogoutOutlined,
    MenuFoldOutlined,
    MenuUnfoldOutlined,
    ProjectOutlined,
    SafetyCertificateOutlined,
    SettingOutlined,
    UserOutlined,
} from '@ant-design/icons';
import { Link, usePage } from '@inertiajs/react';
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

    // ✅ FIXED: Menu items configuration
    const menuItems = [
        {
            key: 'admin.project.index',
            icon: <ProjectOutlined />,
            label: <Link href={route('admin.project.index')}>Projects</Link>,
            title: 'Projects',
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
            key: 'admin.blog-posts.index', // ✅ FIXED: Sesuaikan dengan route name
            icon: <FileTextOutlined />,
            label: (
                <Link href={route('admin.blog-posts.index')}>Mini Blog</Link>
            ), // ✅ FIXED: Pakai route helper
            title: 'Blog Posts',
        },
    ];

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
            label: (
                <Link href="/logout" method="post" as="button">
                    Logout
                </Link>
            ),
            danger: true,
        },
    ];

    // ✅ IMPROVED: Get current active menu key
    const getCurrentMenuKey = () => {
        // Method 1: Cek via Ziggy route().current()
        try {
            const currentRoute = route().current();
            console.log('🔍 Current Route (Ziggy):', currentRoute);

            if (currentRoute) {
                // Certificate routes
                if (currentRoute.startsWith('admin.certificate')) {
                    console.log('✅ Matched: Certificates');
                    return 'admin.certificate.index';
                }
                // Project routes
                if (currentRoute.startsWith('admin.project')) {
                    console.log('✅ Matched: Projects');
                    return 'admin.project.index';
                }
                // ✅ FIXED: Blog posts routes (sesuaikan dengan route name)
                if (currentRoute.startsWith('admin.blog-posts')) {
                    console.log('✅ Matched: Blog Posts');
                    return 'admin.blog-posts.index';
                }
            }
        } catch (e) {
            console.log('⚠️ Ziggy route checking failed:', e.message);
        }

        // Method 2: Fallback ke URL checking
        console.log('🔍 Current URL:', url);

        if (!url) {
            console.log('⚠️ URL is empty, defaulting to project');
            return 'admin.project.index';
        }

        // Normalize URL
        const normalizedUrl = url.replace(/\/$/, '').toLowerCase();
        console.log('🔍 Normalized URL:', normalizedUrl);

        // Check URL patterns
        if (normalizedUrl.match(/\/admin\/certificate/)) {
            console.log('✅ Matched via URL: Certificates');
            return 'admin.certificate.index';
        }

        if (normalizedUrl.match(/\/admin\/project/)) {
            console.log('✅ Matched via URL: Projects');
            return 'admin.project.index';
        }

        // ✅ FIXED: Blog posts URL pattern (sesuaikan dengan route URL)
        if (normalizedUrl.match(/\/admin\/blog-posts/)) {
            console.log('✅ Matched via URL: Blog Posts');
            return 'admin.blog-posts.index';
        }

        console.log('⚠️ No match found, defaulting to project');
        return 'admin.project.index';
    };

    // ✅ IMPROVED: Generate breadcrumb dari URL
    const getBreadcrumbItems = () => {
        const items = [];

        if (!url) return items;

        // Split URL: "/admin/blog-posts/create" → ["admin", "blog-posts", "create"]
        const segments = url.split('/').filter(Boolean);

        // Skip "admin" dari breadcrumb (karena sudah jelas kita di admin panel)
        if (segments.length > 1) {
            // Segment ke-2: project, certificate, blog-posts, dll
            const section = segments[1];

            // ✅ Handle multi-word sections (blog-posts → Blog Posts)
            let sectionLabel = section;
            if (section === 'blog-posts') {
                sectionLabel = 'Blog Posts';
            } else {
                sectionLabel =
                    section.charAt(0).toUpperCase() + section.slice(1);
            }

            items.push({
                title: <Link href={`/admin/${section}`}>{sectionLabel}</Link>,
            });

            // Kalau ada segment ke-3: create, edit, atau ID
            if (segments.length > 2) {
                const action = segments[2];

                // Kalau "create" atau "edit" (bukan ID)
                if (action === 'create' || action === 'edit') {
                    items.push({
                        title: action.charAt(0).toUpperCase() + action.slice(1),
                    });
                } else if (!isNaN(action)) {
                    // Kalau numeric ID, berarti edit
                    items.push({
                        title: 'Edit',
                    });
                } else {
                    // Kalau slug, berarti edit juga
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
