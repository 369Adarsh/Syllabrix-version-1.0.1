/**
 * Cloudinary Data Cleanup Script
 * Permanently deletes all images, videos, and raw files from the account.
 */
const cloudinary = require('../src/config/cloudinary');
const config = require('../src/config/env');

async function cleanup() {
  console.log('--- CLOUDINARY DATA CLEANUP STARTING ---');
  console.log('Cloud Name:', config.CLOUDINARY.CLOUD_NAME);
  
  if (!config.CLOUDINARY.CLOUD_NAME || !config.CLOUDINARY.API_KEY || !config.CLOUDINARY.API_SECRET) {
    console.error('ERROR: Cloudinary credentials missing in environment.');
    process.exit(1);
  }

  const resourceTypes = ['image', 'video', 'raw'];

  for (const type of resourceTypes) {
    try {
      console.log(`\nDeleting ALL '${type}' resources...`);
      let hasMore = true;
      let deletedCount = 0;

      while (hasMore) {
        const result = await cloudinary.api.delete_all_resources({
          resource_type: type,
          all: true,
          keep_original: false
        });

        const deleted = result.deleted ? Object.keys(result.deleted).length : 0;
        deletedCount += deleted;
        console.log(` - Deleted batch of ${deleted} resources.`);

        if (!result.next_cursor) {
          hasMore = false;
        }
      }
      
      console.log(`SUCCESS: Total '${type}' resources deleted: ${deletedCount}`);
    } catch (error) {
      console.error(`ERROR deleting '${type}' resources:`, error.message);
    }
  }

  try {
    console.log('\nCleaning up subfolders...');
    const result = await cloudinary.api.root_folders();
    if (result && result.folders) {
      for (const folder of result.folders) {
        console.log(` - Deleting folder: ${folder.name}`);
        try {
          await cloudinary.api.delete_folder(folder.name);
        } catch (fErr) {
           console.warn(`    - Could not delete folder ${folder.name}: ${fErr.message}`);
        }
      }
    }
    console.log('SUCCESS: Folder cleanup iteration complete.');
  } catch (error) {
    console.warn('NOTE: Root folder listing failed:', error.message);
  }

  console.log('\n--- CLOUDINARY DATA CLEANUP COMPLETE ---');
}

cleanup().catch(err => {
  console.error('FATAL ERROR:', err.message);
  process.exit(1);
});
