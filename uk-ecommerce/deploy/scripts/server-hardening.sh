#!/usr/bin/env bash
# One-off VPS hardening for Ubuntu 24.04 LTS. Run as root after first login.
set -euo pipefail
apt-get update && apt-get -y upgrade
apt-get -y install unattended-upgrades ufw fail2ban ca-certificates curl
dpkg-reconfigure -f noninteractive unattended-upgrades
ufw default deny incoming && ufw default allow outgoing
ufw allow OpenSSH && ufw allow 80/tcp && ufw allow 443/tcp && ufw --force enable
# SSH: keys only
sed -i 's/^#\?PasswordAuthentication .*/PasswordAuthentication no/' /etc/ssh/sshd_config
sed -i 's/^#\?PermitRootLogin .*/PermitRootLogin prohibit-password/' /etc/ssh/sshd_config
systemctl restart ssh || systemctl restart sshd
# Docker (official convenience script — review it first: https://get.docker.com)
curl -fsSL https://get.docker.com -o /tmp/get-docker.sh && sh /tmp/get-docker.sh
echo "Hardening complete. Docker installed. Firewall allows SSH, HTTP, HTTPS only."
