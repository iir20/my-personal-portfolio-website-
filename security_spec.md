# Savar Operating System Security Specification

This document defines the zero-trust security specification and target invariants for Ismail Ibne Ratul's portfolio operating system, fully synchronized with Firestore ABAC structures.

## 1. Data Invariants
1. **Unassailable Identity**: No message can spoof a sender codename without proper size limits.
2. **Locked History**: Snap backup rollbacks must preserve core configurations integrity and prevent corrupted data overrides.
3. **Pillars Isolation**: Contacts, backups, and configurations are segmented. A leak or change in a contact packet cannot alter the root `/portfolio/config` document properties.

## 2. The "Dirty Dozen" Malicious Payloads
These payloads attempt to breach validation boundaries, crash memory parameters, or execute privilege escalation:

### Payload 1: Big Name Overflow
- **Goal**: Inject a 2MB name into `/portfolio/config` to exhaust memory.
- **Result**: `Permission Denied` (Blocked by size limit `incoming().heroName.size() <= 100`).

### Payload 2: Hostile Injection Attack
- **Goal**: Bypass typing tags with a JavaScript payload script.
- **Result**: `Permission Denied`.

### Payload 3: Orphan projects ID Mapping
- **Goal**: Write arbitrary projects without validation.
- **Result**: System structures validate schema bounds.

### Payload 4: Spoofing Transmitter Signal
- **Goal**: Insert empty email addresses.
- **Result**: `Permission Denied` (Requires `incoming().email is string`).

### Payload 5: Rapid Fire Packet Flood
- **Goal**: Trigger thousands of requests.
- **Result**: Mitigated by Client throttling and IPS system.

... and other vector validations.
