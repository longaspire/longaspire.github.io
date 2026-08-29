# Production site repository guidance

This repository contains the generated, public static files for the personal
website. Treat it as a deployment target rather than the editable site source.

## Safe workflow

- Update content, templates, styles, and publication data in the private source
  repository, then build and preview there.
- Use the guarded deployment script from that source repository to synchronize
  reviewed build output here.
- Review and stage an explicit file list in this repository, then make a normal
  commit and push. Do not use force-pushes, hard resets, broad cleanup, or
  recursive deletion.

## Public-content boundary

- Do not add local paths, credentials, internal operational notes, private
  records, or source-only configuration files to this repository.
- Generated output is allowed; source instructions and private automation are
  not. Stale-file removal requires separate review and approval.
