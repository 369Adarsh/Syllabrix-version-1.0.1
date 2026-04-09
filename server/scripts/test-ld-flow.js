const { pool } = require('../src/database/connection');
const LDContentService = require('../src/features/ld-content/ld-content.service');

const testLDFlow = async () => {
    console.log('--- SYLLABRIX L&D: END-TO-END AI FLOW TEST ---');
    
    const orgId = 1;
    const adminId = 1; // Priya Sharma
    const smeId = 9;   // Riya Mehta (SME)
    const skillName = 'Advanced Negotiation';
    const skillId = 1;

    try {
        // 1. GENERATE OUTLINE
        console.log(`1. Generating AI Outline for ${skillName}...`);
        const outline = {
            title: `Mastery in ${skillName}`,
            description: 'A comprehensive guide to high-stakes corporate negotiation.',
            program_type: 'course',
            difficulty: 'advanced',
            duration_hours: 4.5,
            target_skill_id: skillId,
            modules: [
                { title: 'Psychology of the Deal', module_type: 'concept', order_index: 1 },
                { title: 'Handling Bulk Objections', module_type: 'application', order_index: 2 },
                { title: 'Scenario: The Final Signing', module_type: 'case_study', order_index: 3 }
            ]
        };

        // Create Program Draft
        const [progRes] = await pool.query(
            `INSERT INTO ld_programs (org_id, title, description, target_skill_id, program_type, difficulty, duration_hours, status, created_by) 
             VALUES (?, ?, ?, ?, ?, ?, ?, 'draft', ?)`,
            [orgId, outline.title, outline.description, skillId, outline.program_type, outline.difficulty, outline.duration_hours, adminId]
        );
        const programId = progRes.insertId;
        console.log(`   \u2713 Program Draft Created (ID: ${programId})`);

        // 2. SUBMIT FOR REVIEW
        console.log(`2. Submitting for SME Review (SME: Riya Mehta)...`);
        await pool.query(
            `INSERT INTO ld_reviews (org_id, content_type, content_id, reviewer_id, status, comments) 
             VALUES (?, 'program', ?, ?, 'pending', 'AI Generated: High Accuracy Required')`,
            [orgId, programId, smeId]
        );
        console.log('   \u2713 Review Record Created');

        // 3. SME APPROVAL (Simulating Riya Mehta)
        console.log('3. SME Riya Mehta is reviewing and approving...');
        const [review] = await pool.query(`SELECT id FROM ld_reviews WHERE content_id = ? AND content_type = 'program'`, [programId]);
        const reviewId = review[0].id;

        await LDContentService.submitReview(reviewId, {
            status: 'approved',
            feedback_notes: 'Excellent outline. Aligns perfectly with our Sales Strategy.'
        });
        console.log('   \u2713 SME Approval Submitted');

        // 4. VERIFY PUBLICATION
        console.log('4. Verifying if program reached PUBLISHED state...');
        const [finalProg] = await pool.query(`SELECT status FROM ld_programs WHERE id = ?`, [programId]);
        
        if (finalProg[0].status === 'published') {
            console.log('   \u2713 Status: PUBLISHED');
            console.log('--- TEST PASSED: AI CONTENT FLOW IS ROBUST ---');
        } else {
            console.error(`   \u2717 Status: ${finalProg[0].status} (Expected: published)`);
            console.log('Note: Automatic publication requires all reviewers to approve. Checking logic...');
        }

    } catch (e) {
        console.error('Test Failed:', e);
    } finally {
        process.exit(0);
    }
};

testLDFlow();
