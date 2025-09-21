# Setup Local Validation Script

To create a local version of the validation script with your environment-specific values:

## Step 1: Copy the public template
```bash
cp .github/validate-setup-public.sh .github/validate-setup.sh
```

## Step 2: Edit the local script
Add your environment-specific values at the top of `.github/validate-setup.sh`:

```bash
#!/bin/bash
# Local validation script with environment-specific values

# Set your environment variables here
export DEPLOY_HOST="your-server-ip"
export DEPLOY_USER="your-deployment-user"  
export DEPLOY_PORT="your-ssh-port"

# Rest of the script remains the same...
```

## Step 3: Make it executable
```bash
chmod +x .github/validate-setup.sh
```

## Step 4: Run the validation
```bash
./.github/validate-setup.sh
```

## Note
The local `validate-setup.sh` file is automatically ignored by git and will not be committed to the repository.

## Alternative: Use environment variables
You can also set environment variables before running the public script:

```bash
export DEPLOY_HOST="your-server-ip"
export DEPLOY_USER="deployer"
export DEPLOY_PORT="22"
./.github/validate-setup-public.sh
```