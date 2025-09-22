# Security Guidelines for GitHub Actions Deployment

## Sensitive Information Management

This repository uses GitHub Actions for automated deployment. To maintain security:

### 1. GitHub Secrets Configuration

All sensitive information is stored as GitHub repository secrets:

- `DEPLOY_HOST` - Server IP address or domain
- `DEPLOY_USER` - Deployment user account
- `DEPLOY_PORT` - SSH connection port
- `DEPLOY_KEY` - SSH private key for authentication

### 2. Files Excluded from Repository

The following files contain sensitive information and are excluded via `.gitignore`:

- `.github/validate-setup.sh` - Contains server-specific configuration
- Environment files with production values

### 3. Public vs Private Scripts

- `validate-setup-public.sh` - Safe for public repositories
- `validate-setup.sh` - Contains environment-specific values (gitignored)

### 4. Environment Variables in Workflows

GitHub Actions workflows reference secrets using the `${{ secrets.SECRET_NAME }}` syntax to avoid exposing sensitive data.

### 5. Best Practices

1. **Never commit sensitive data** to the repository
2. **Use GitHub secrets** for all configuration values
3. **Review workflow files** before making them public
4. **Test with minimal permissions** first
5. **Monitor deployment logs** for any exposed information

### 6. Local Development

For local testing, create a copy of `validate-setup-public.sh` and:

1. Copy it to `validate-setup.sh`
2. Add your environment-specific values
3. The file will be automatically ignored by git

### 7. Production Deployment

The deployment scripts automatically use the configured GitHub secrets when running on the self-hosted runner.