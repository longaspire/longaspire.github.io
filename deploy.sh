#!/usr/bin/env bash

# This repository is a public, generated deployment target. Publishing from
# here is intentionally disabled to prevent destructive resets, broad deletion,
# and force-pushes. Build and synchronize from the reviewed private source
# repository instead.

set -Eeuo pipefail

printf '%s\n' 'Deployment is disabled in this generated public repository.' >&2
printf '%s\n' 'Run the guarded deployment script from the private source repository.' >&2
exit 2
