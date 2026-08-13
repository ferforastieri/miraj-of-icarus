#!/usr/bin/env bash
set -euo pipefail

if [[ ${EUID} -ne 0 ]]; then
  echo "execute with sudo: sudo $0" >&2
  exit 1
fi

if [[ ! -s /home/ubuntu/.ssh/authorized_keys ]]; then
  echo "refusing to disable password login: /home/ubuntu/.ssh/authorized_keys is empty" >&2
  exit 1
fi

export DEBIAN_FRONTEND=noninteractive
apt-get update
apt-get install -y --no-install-recommends fail2ban unattended-upgrades

install -d -m 0755 /etc/ssh/sshd_config.d
printf '%s\n' \
  'PasswordAuthentication no' \
  'KbdInteractiveAuthentication no' \
  'PermitRootLogin no' \
  'MaxAuthTries 4' \
  'LoginGraceTime 30' \
  > /etc/ssh/sshd_config.d/60-miraj-hardening.conf
sshd -t
systemctl reload ssh

install -d -m 0755 /etc/fail2ban/jail.d
printf '%s\n' \
  '[sshd]' \
  'enabled = true' \
  'bantime = 1h' \
  'findtime = 10m' \
  'maxretry = 5' \
  > /etc/fail2ban/jail.d/miraj-sshd.local
systemctl enable --now fail2ban

printf '%s\n' \
  'APT::Periodic::Update-Package-Lists "1";' \
  'APT::Periodic::Unattended-Upgrade "1";' \
  > /etc/apt/apt.conf.d/20auto-upgrades
systemctl enable --now unattended-upgrades

echo "Lightsail host hardening applied. Keep the current SSH session open and test a second key-based connection before disconnecting."
