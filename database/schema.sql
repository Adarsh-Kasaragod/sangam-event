-- ==========================================================================
-- Sangam Event Portal — Database Schema
-- Import this file into MySQL/phpMyAdmin before running the app.
-- Run: mysql -u root -p event_app < database/schema.sql
-- ==========================================================================

CREATE DATABASE IF NOT EXISTS event_app
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

USE event_app;

-- --------------------------------------------------------------------------
-- events table
-- image_url stores an external URL or relative path (no file upload in v1)
-- capacity NULL means unlimited
-- registration_deadline NULL means open until event date
-- --------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS events (
    id                    INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    title                 VARCHAR(255)  NOT NULL,
    description           TEXT          NOT NULL,
    event_date            DATETIME      NOT NULL,
    venue                 VARCHAR(255)  NOT NULL,
    image_url             VARCHAR(512)  NULL,
    capacity              INT UNSIGNED  NULL COMMENT 'NULL = unlimited',
    registration_deadline DATETIME      NULL COMMENT 'NULL = open until event date',
    created_at            TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_event_date (event_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------------------------
-- registrations table
-- ON DELETE CASCADE: deleting an event removes its registrations.
-- UNIQUE (event_id, email) prevents a student from registering twice.
-- Decision rationale: Cascade deletion simplifies admin operations and avoids
-- orphaned records. Documented in README.md.
-- --------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS registrations (
    id         INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    event_id   INT UNSIGNED  NOT NULL,
    name       VARCHAR(255)  NOT NULL,
    email      VARCHAR(255)  NOT NULL,
    phone      VARCHAR(20)   NOT NULL,
    created_at TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_reg_event
        FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
    UNIQUE KEY uq_event_email (event_id, email),
    INDEX idx_reg_event (event_id),
    INDEX idx_reg_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------------------------
-- admins table
-- Passwords stored as bcrypt hashes (password_hash() with PASSWORD_BCRYPT).
-- Default admin: admin@college.edu / Admin@123
-- Run setup_admin.php to regenerate the hash if needed.
-- --------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS admins (
    id            INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    email         VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    created_at    TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------------------------
-- Default admin user
-- Password: Admin@123  (bcrypt hash generated with password_hash())
-- --------------------------------------------------------------------------
INSERT INTO admins (email, password_hash) VALUES
(
    'admin@college.edu',
    '$2y$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi'
    -- ^ This is a placeholder. Run setup_admin.php to generate a real hash.
    -- Or replace with: php -r "echo password_hash('Admin@123', PASSWORD_BCRYPT);"
)
ON DUPLICATE KEY UPDATE email = email;

-- --------------------------------------------------------------------------
-- 6 Sample Events (relative to 2026-10-29)
-- 1. Web Development Workshop    — Upcoming  (2026-11-15)
-- 2. Annual Tech Fest            — Upcoming  (2026-12-05)
-- 3. Campus Hackathon 2026       — Upcoming  (2027-01-20)
-- 4. AI Seminar                  — Upcoming, capacity=2 (2026-11-08)
-- 5. Freshers' Welcome           — Past      (2026-08-10)
-- 6. Career Guidance Talk        — Upcoming date but deadline passed (2026-11-20, deadline 2026-10-20)
-- --------------------------------------------------------------------------
INSERT INTO events (title, description, event_date, venue, image_url, capacity, registration_deadline) VALUES

(
    'Web Development Workshop',
    'A hands-on full-day workshop covering modern web development fundamentals — HTML5, CSS3, JavaScript ES2024, and an introduction to React. Led by industry professionals from top tech companies. Participants will build a responsive portfolio page from scratch. Laptops are mandatory; all experience levels welcome.',
    '2026-11-15 09:00:00',
    'Computer Science Block, Lab 3, Ground Floor',
    'https://images.unsplash.com/photo-1517180102446-f3ece451e9d8?w=800&q=80',
    NULL,
    '2026-11-12 23:59:00'
),

(
    'Annual Tech Fest',
    'The college''s flagship technology festival returns! Three days packed with coding competitions, hackathons, robotics showcases, guest lectures from Silicon Valley veterans, and a startup pitch competition with cash prizes up to ₹50,000. Open to students from all departments and partner institutions.',
    '2026-12-05 10:00:00',
    'Main Auditorium & Open Amphitheatre, Central Campus',
    'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&q=80',
    NULL,
    '2026-11-30 23:59:00'
),

(
    'Campus Hackathon 2026',
    'A 36-hour non-stop hackathon challenging teams of 2–4 students to build innovative solutions for real-world problems in education, healthcare, and sustainability. Mentors from leading tech firms will guide teams. Prizes worth ₹1,00,000 and internship opportunities await the top three teams. Food and beverages provided.',
    '2027-01-20 08:00:00',
    'Innovation Hub, New Academic Block, 2nd Floor',
    'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800&q=80',
    NULL,
    '2027-01-15 23:59:00'
),

(
    'AI Seminar: Future of Intelligent Systems',
    'An exclusive seminar exploring the latest advancements in Artificial Intelligence, Machine Learning, and Generative AI. Dr. Priya Sharma, Research Scientist at Google DeepMind, will deliver the keynote. Limited seating — only 2 spots available. Attendees will receive a certificate of participation and access to exclusive reading materials.',
    '2026-11-08 14:00:00',
    'Seminar Hall B, Science Block, 1st Floor',
    'https://images.unsplash.com/photo-1677442135703-1787eea5ce01?w=800&q=80',
    2,
    '2026-11-06 23:59:00'
),

(
    'Freshers'' Welcome 2026',
    'A vibrant and memorable welcome ceremony for the Class of 2026! The event featured cultural performances by senior students, an introduction to college clubs and societies, a talent showcase by the newcomers, and a grand dinner. First-year students got to meet faculty, mentors, and peer advisors in a festive atmosphere.',
    '2026-08-10 17:00:00',
    'College Open-Air Theatre, Main Campus',
    'https://images.unsplash.com/photo-1523580494863-6f3031224c94?w=800&q=80',
    NULL,
    NULL
),

(
    'Career Guidance Talk',
    'An interactive career counselling session featuring HR managers and senior recruiters from five top companies: TCS, Infosys, Wipro, Capgemini, and Accenture. Topics include resume building, technical interview preparation, aptitude test strategies, and navigating campus placements. Q&A session included. Open to third- and final-year students.',
    '2026-11-20 11:00:00',
    'Placement Cell Conference Room, Admin Block',
    'https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&q=80',
    NULL,
    '2026-10-20 23:59:00'
),

(
    'Prarambh 2026',
    'Prarambh — meaning "The Beginning" — is Sangam College''s grand annual cultural fest celebrating the richness of Indian art, music, dance, and heritage. The three-day extravaganza features classical and folk dance performances, Carnatic and Hindustani music concerts, street plays, poetry slams, art exhibitions, and a vibrant food street with cuisines from across India. Teams from 12 partner colleges compete in cultural competitions with prizes worth ₹75,000. A celebration of tradition meeting modernity, Prarambh 2026 promises to be an unforgettable beginning for the new academic year.',
    '2026-12-20 09:00:00',
    'Open-Air Amphitheatre & Central Campus Grounds',
    'https://images.unsplash.com/photo-1583089892943-e02e5b017b6a?w=800&q=80',
    500,
    '2026-12-15 23:59:00'
);

-- Dummy registrations for Prarambh 2026 (event_id = 7)
INSERT INTO registrations (event_id, name, email, phone) VALUES
(7, 'Aarav Sharma',       'aarav.sharma@sangam.edu',       '9876543210'),
(7, 'Aditya Verma',       'aditya.verma@sangam.edu',       '9823456789'),
(7, 'Akash Patel',        'akash.patel@sangam.edu',        '9834567890'),
(7, 'Ananya Nair',        'ananya.nair@sangam.edu',        '9845678901'),
(7, 'Anjali Singh',       'anjali.singh@sangam.edu',       '9856789012'),
(7, 'Arjun Menon',        'arjun.menon@sangam.edu',        '9867890123'),
(7, 'Aryan Gupta',        'aryan.gupta@sangam.edu',        '9878901234'),
(7, 'Ashwin Kumar',       'ashwin.kumar@sangam.edu',       '9889012345'),
(7, 'Bhavana Reddy',      'bhavana.reddy@sangam.edu',      '9890123456'),
(7, 'Chetan Joshi',       'chetan.joshi@sangam.edu',       '9901234567'),
(7, 'Deepa Iyer',         'deepa.iyer@sangam.edu',         '9812345670'),
(7, 'Devansh Mishra',     'devansh.mishra@sangam.edu',     '9823456701'),
(7, 'Divya Krishnan',     'divya.krishnan@sangam.edu',     '9834567812'),
(7, 'Ganesh Pillai',      'ganesh.pillai@sangam.edu',      '9845678923'),
(7, 'Gaurav Tiwari',      'gaurav.tiwari@sangam.edu',      '9856789034'),
(7, 'Harini Subramanian', 'harini.subramanian@sangam.edu', '9867890145'),
(7, 'Harsh Agarwal',      'harsh.agarwal@sangam.edu',      '9878901256'),
(7, 'Ishaan Choudhury',   'ishaan.choudhury@sangam.edu',   '9889012367'),
(7, 'Ishita Bose',        'ishita.bose@sangam.edu',        '9890123478'),
(7, 'Jaya Rao',           'jaya.rao@sangam.edu',           '9901234589'),
(7, 'Kabir Khan',         'kabir.khan@sangam.edu',         '9812345681'),
(7, 'Karthik Narayanan',  'karthik.narayanan@sangam.edu',  '9823456792'),
(7, 'Kavya Desai',        'kavya.desai@sangam.edu',        '9834567803'),
(7, 'Keerthi Venkat',     'keerthi.venkat@sangam.edu',     '9845678914'),
(7, 'Kriti Pandey',       'kriti.pandey@sangam.edu',       '9856789025'),
(7, 'Lakshmi Prasad',     'lakshmi.prasad@sangam.edu',     '9867890136'),
(7, 'Madhav Rao',         'madhav.rao@sangam.edu',         '9878901247'),
(7, 'Meghna Kapoor',      'meghna.kapoor@sangam.edu',      '9889012358'),
(7, 'Mohit Saxena',       'mohit.saxena@sangam.edu',       '9890123469'),
(7, 'Nakul Bajaj',        'nakul.bajaj@sangam.edu',        '9901234570'),
(7, 'Neha Kulkarni',      'neha.kulkarni@sangam.edu',      '9812345682'),
(7, 'Nikhil Shetty',      'nikhil.shetty@sangam.edu',      '9823456793'),
(7, 'Nisha Varma',        'nisha.varma@sangam.edu',        '9834567804'),
(7, 'Pallavi Deshpande',  'pallavi.deshpande@sangam.edu',  '9845678915'),
(7, 'Parth Malhotra',     'parth.malhotra@sangam.edu',     '9856789026'),
(7, 'Pooja Hegde',        'pooja.hegde@sangam.edu',        '9867890137'),
(7, 'Pranav Dixit',       'pranav.dixit@sangam.edu',       '9878901248'),
(7, 'Priya Chandran',     'priya.chandran@sangam.edu',     '9889012359'),
(7, 'Rahul Bhatia',       'rahul.bhatia@sangam.edu',       '9890123460'),
(7, 'Rakesh Nambiar',     'rakesh.nambiar@sangam.edu',     '9901234571'),
(7, 'Riya Jain',          'riya.jain@sangam.edu',          '9812345683'),
(7, 'Rohan Ghosh',        'rohan.ghosh@sangam.edu',        '9823456794'),
(7, 'Rohit Srivastava',   'rohit.srivastava@sangam.edu',   '9834567805'),
(7, 'Sachin Pawar',       'sachin.pawar@sangam.edu',       '9845678916'),
(7, 'Sahil Mehta',        'sahil.mehta@sangam.edu',        '9856789027'),
(7, 'Sanika Patil',       'sanika.patil@sangam.edu',       '9867890138'),
(7, 'Siddharth Rao',      'siddharth.rao@sangam.edu',      '9878901249'),
(7, 'Sneha Tripathi',     'sneha.tripathi@sangam.edu',     '9889012350'),
(7, 'Suresh Babu',        'suresh.babu@sangam.edu',        '9890123461'),
(7, 'Tanvi Bhatt',        'tanvi.bhatt@sangam.edu',        '9901234572'),
(7, 'Tejas Wagh',         'tejas.wagh@sangam.edu',         '9812345684'),
(7, 'Usha Pillai',        'usha.pillai@sangam.edu',        '9823456795'),
(7, 'Varun Sethi',        'varun.sethi@sangam.edu',        '9834567806'),
(7, 'Vedant Joshi',       'vedant.joshi@sangam.edu',       '9845678917'),
(7, 'Vidya Shankar',      'vidya.shankar@sangam.edu',      '9856789028'),
(7, 'Vikram Chatterjee',  'vikram.chatterjee@sangam.edu',  '9867890139'),
(7, 'Vipul Agarwal',      'vipul.agarwal@sangam.edu',      '9878901250'),
(7, 'Vishal Khanna',      'vishal.khanna@sangam.edu',      '9889012361'),
(7, 'Yash Doshi',         'yash.doshi@sangam.edu',         '9890123462'),
(7, 'Zara Qureshi',       'zara.qureshi@sangam.edu',       '9901234573');
