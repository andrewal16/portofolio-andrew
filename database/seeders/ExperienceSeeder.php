<?php

namespace Database\Seeders;

use App\Models\Experience;
use Illuminate\Database\Seeder;

class ExperienceSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $experiences = [
            [
                'slug' => 'binus-it-division-frontend-lead',
                'company_name' => 'BINUS IT Division',
                'company_logo' => '/images/companies/binus.png', // Store di public/images/companies
                'position' => 'Junior Programmer – Full Stack Developer',
                'employment_type' => 'contract',
                'start_date' => '2024-03-01',
                'end_date' => null, // Currently working
                'description' => 'Leading frontend architecture for enterprise applications serving 10,000+ users. Architected custom CMS transforming legacy systems into modern, scalable platforms.',
                'detailed_description' => "As Frontend Lead at BINUS IT Division, I spearhead the development of mission-critical systems that serve the university's ecosystem of 10,000+ users.\n\n**Key Responsibilities:**\n- Architect and implement scalable frontend solutions using React + Inertia.js\n- Lead technical decisions for the Student Regulation internal system\n- Transform legacy systems into modern web applications\n- Optimize performance through strategic database indexing and component-based rendering\n\n**Major Project: Keuskupan Agung Makassar (KAMS) CMS**\nTransformed a static website into a dynamic, SEO-friendly Single Page Application, enabling real-time content management for news, events, and database updates.",
                'location' => 'Jakarta',
                'is_remote' => false,
                'key_achievements' => [
                    'Architected Custom CMS for Keuskupan Agung Makassar, transforming legacy static site into dynamic platform',
                    'Led Frontend Architecture for internal Student Regulation system (10,000+ users)',
                    'Reduced load times through strategic database indexing and component optimization',
                    'Implemented Modern LIR Stack (Laravel + Inertia.js + React) for SPA without API complexity',
                ],
                'metrics' => [
                    '10,000+ Active Users',
                    '3+ Major Systems Delivered',
                    'SEO-Optimized SPAs',
                ],
                'tech_stack' => ['Laravel', 'Inertia.js', 'React.js', 'MySQL', 'C# ASP.NET', 'Git'],
                'gallery' => [
                    '/images/experiences/binus-1.jpg',
                    '/images/experiences/binus-2.jpg',
                    '/images/experiences/binus-3.jpg',
                ],
                'is_featured' => true,
                'is_published' => true,
                'display_order' => 1,
            ],
            [
                'slug' => 'terra-ai-ai4impact-scholar',
                'company_name' => 'Terra AI',
                'company_logo' => '/images/companies/terra-ai.png',
                'position' => 'AI4Impact Scholar',
                'employment_type' => 'internship',
                'start_date' => '2024-09-01',
                'end_date' => '2024-12-31',
                'description' => 'Selected from 2,700 applicants (0.26% acceptance rate) for exclusive AI scholarship program. Mastered proprietary AI frameworks and real-world API integrations.',
                'detailed_description' => "Elite selection into Terra AI's prestigious AI4Impact scholarship program, competing against 2,700 applicants across Southeast Asia.\n\n**Program Highlights:**\n- Intensive training in cutting-edge AI technologies and applications\n- Hands-on implementation of real-world API integrations\n- Mentorship from industry leaders in AI/ML space\n- Built professional network with fellow scholars across the region\n\n**Technical Focus:**\n- Proprietary AI frameworks and tools\n- Production-grade API integration patterns\n- Scalable AI system architecture\n- Industry best practices in ML deployment",
                'location' => 'Singapore (Remote)',
                'is_remote' => true,
                'key_achievements' => [
                    'Selected from 2,700 applicants (0.26% acceptance rate)',
                    'Completed intensive AI/ML training program',
                    'Implemented real-world API integrations with proprietary frameworks',
                    'Built professional network across Southeast Asia AI community',
                ],
                'metrics' => [
                    '0.26% Acceptance Rate',
                    '2,700+ Applicants',
                    'Cross-Regional Network',
                ],
                'tech_stack' => ['Python', 'TensorFlow', 'PyTorch', 'REST APIs', 'Machine Learning', 'Deep Learning'],
                'gallery' => [
                    '/images/experiences/terra-ai-1.jpg',
                    '/images/experiences/terra-ai-2.jpg',
                ],
                'is_featured' => true,
                'is_published' => true,
                'display_order' => 2,
            ],
            [
                'slug' => 'splus-teacher-coordinator',
                'company_name' => 'SPLUS',
                'company_logo' => '/images/companies/splus.png',
                'position' => 'Teacher Coordinator',
                'employment_type' => 'contract',
                'start_date' => '2022-10-01',
                'end_date' => '2024-02-28',
                'description' => 'Led curriculum management, quality assurance, and professional development initiatives. Optimized educational materials and enhanced teaching effectiveness.',
                'detailed_description' => "Managed comprehensive curriculum oversight and educational quality assurance for SPLUS, ensuring alignment with evolving standards and best practices.\n\n**Core Responsibilities:**\n- Curriculum compliance and optimization through systematic reviews\n- Quality assurance via classroom observations and data-driven feedback\n- Professional development leadership integrating latest educational trends\n- Performance optimization strategies for teaching staff\n\n**Impact:**\nImplemented data-driven feedback systems that enhanced both teaching effectiveness and student engagement across multiple classrooms.",
                'location' => 'Jakarta Barat',
                'is_remote' => false,
                'key_achievements' => [
                    'Ensured curriculum compliance through regular reviews and alignment',
                    'Conducted systematic classroom observations with data-driven feedback',
                    'Led professional development programs with latest educational innovations',
                    'Enhanced teaching effectiveness and student engagement metrics',
                ],
                'metrics' => [
                    'Multiple Classrooms Managed',
                    'Improved Teaching Standards',
                    'Enhanced Student Engagement',
                ],
                'tech_stack' => ['Microsoft Office', 'Google Workspace', 'Educational Technology'],
                'gallery' => [
                    '/images/experiences/splus-1.jpg',
                ],
                'is_featured' => false,
                'is_published' => true,
                'display_order' => 3,
            ],
            [
                'slug' => 'scode-founder-teacher',
                'company_name' => 'SCODE',
                'company_logo' => '/images/companies/scode.png',
                'position' => 'Founder & Teacher',
                'employment_type' => 'freelance',
                'start_date' => '2023-02-01',
                'end_date' => '2024-03-31',
                'description' => 'Founded coding education startup. Designed multi-level curriculum and delivered engaging workshops balancing theory with hands-on projects.',
                'detailed_description' => "Entrepreneurial venture establishing coding education programs for diverse age groups, combining business development with instructional excellence.\n\n**Business Development:**\n- Launched strategic marketing initiatives to attract diverse student enrollment\n- Built brand identity and market positioning for coding programs\n- Managed end-to-end business operations\n\n**Educational Innovation:**\n- Designed comprehensive multi-level coding curriculum\n- Integrated current programming languages and industry best practices\n- Delivered engaging workshops with hands-on projects\n- Provided personalized mentorship for optimized learning outcomes",
                'location' => 'Jakarta',
                'is_remote' => false,
                'key_achievements' => [
                    'Founded and launched coding education startup from scratch',
                    'Designed multi-level curriculum spanning various age groups',
                    'Integrated current programming languages and industry best practices',
                    'Delivered personalized mentorship optimizing student outcomes',
                ],
                'metrics' => [
                    'Startup Founded',
                    'Multi-Level Curriculum',
                    'Diverse Student Base',
                ],
                'tech_stack' => ['Python', 'JavaScript', 'HTML/CSS', 'Educational Technology'],
                'gallery' => [
                    '/images/experiences/scode-1.jpg',
                    '/images/experiences/scode-2.jpg',
                ],
                'is_featured' => false,
                'is_published' => true,
                'display_order' => 4,
            ],
        ];

        foreach ($experiences as $experience) {
            Experience::create($experience);
        }
    }
}