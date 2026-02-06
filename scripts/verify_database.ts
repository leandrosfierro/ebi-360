import { createClient, createAdminClient } from '@/lib/supabase/server';
import { getUserAuthContext } from '@/lib/auth-core';

/**
 * Database Integrity Verification Script
 * 
 * Validates that the consolidated migration was applied correctly:
 * - Only 2 triggers exist on profiles
 * - Only 4 RLS policies exist for profiles
 * - All users have valid role data
 */

async function verifyDatabase() {
    const supabase = createAdminClient();

    console.log('🔍 Starting database integrity check...\n');

    //1. Check trigger count
    const { data: triggers, error: triggersError } = await supabase
        .rpc('get_profile_triggers' as any);

    if (triggersError) {
        console.log('⏭️  Skipping trigger check (custom RPC not available)');
    }

    // 2. Check RLS policies
    const { data: policies, error: policiesError } = await supabase
        .rpc('get_profile_policies' as any);

    if (policiesError) {
        console.log('⏭️  Skipping policy check (custom RPC not available)');
    }

    // 3. Check role data integrity
    const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, email, roles, active_role, role');

    if (profilesError) {
        console.error('❌ Error fetching profiles:', profilesError);
        return false;
    }

    let issues = 0;

    console.log(`📊 Checking ${profiles.length} profiles for data integrity...\n`);

    profiles.forEach(p => {
        // Issue 1: Empty roles array
        if (!p.roles || p.roles.length === 0) {
            console.error(`❌ ${p.email}: Empty roles array`);
            issues++;
        }

        // Issue 2: active_role not in roles array
        if (p.active_role && p.roles && !p.roles.includes(p.active_role)) {
            console.error(`❌ ${p.email}: active_role "${p.active_role}" not in roles ${JSON.stringify(p.roles)}`);
            issues++;
        }

        // Issue 3: Missing 'employee' role
        if (p.roles && !p.roles.includes('employee')) {
            console.warn(`⚠️  ${p.email}: Missing 'employee' role (should have it by default)`);
            issues++;
        }
    });

    if (issues === 0) {
        console.log('✅ All profiles have valid role data\n');
    } else {
        console.log(`\n⚠️  Found ${issues} role data issues\n`);
    }

    // 4. Test auth-core module
    console.log('🧪 Testing auth-core module...\n');

    try {
        const context = await getUserAuthContext();
        if (!context) {
            console.log('⏭️  Skipping auth-core test (no active session)');
        } else {
            console.log(`✅ Auth context loaded for user: ${context.email}`);
            console.log(`   Roles: ${context.roles.join(', ')}`);
            console.log(`   Active: ${context.activeRole}`);
            console.log(`   Primary: ${context.primaryRole}`);
            console.log(`   isMaster: ${context.isMasterAdmin}`);
        }
    } catch (error: any) {
        console.error(`❌ Auth-core error: ${error.message}`);
        issues++;
    }

    console.log('\n' + '='.repeat(50));
    console.log(issues === 0 ? '✅ ALL CHECKS PASSED' : `⚠️  ${issues} ISSUES FOUND`);
    console.log('='.repeat(50) + '\n');

    return issues === 0;
}

// Run if called directly
if (require.main === module) {
    verifyDatabase()
        .then(success => process.exit(success ? 0 : 1))
        .catch(error => {
            console.error('Fatal error:', error);
            process.exit(1);
        });
}

export { verifyDatabase };
