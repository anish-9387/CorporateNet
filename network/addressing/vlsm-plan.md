# VLSM Addressing Plan

**Project:** CorporateNet  
**Course:** 21CSC302J — Computer Networks  
**Parent Network:** 10.10.0.0/23  
**Date:** 2026-10-11

---

## Subnet Allocation Table

| Department | Host Req | Network Address | Prefix | Subnet Mask | Gateway | Usable Range | Broadcast | Usable Hosts |
|------------|----------|-----------------|--------|-------------|---------|--------------|-----------|--------------|
| Engineering | 100 | 10.10.0.0 | /25 | 255.255.255.128 | 10.10.0.1 | 10.10.0.1 – 10.10.0.126 | 10.10.0.127 | 126 |
| Administration | 50 | 10.10.0.128 | /26 | 255.255.255.192 | 10.10.0.129 | 10.10.0.129 – 10.10.0.190 | 10.10.0.191 | 62 |
| Finance | 25 | 10.10.0.192 | /27 | 255.255.255.224 | 10.10.0.193 | 10.10.0.193 – 10.10.0.222 | 10.10.0.223 | 30 |
| HR | 20 | 10.10.0.224 | /27 | 255.255.255.224 | 10.10.0.225 | 10.10.0.225 – 10.10.0.254 | 10.10.0.255 | 30 |
| IT Support | 12 | 10.10.1.0 | /28 | 255.255.255.240 | 10.10.1.1 | 10.10.1.1 – 10.10.1.14 | 10.10.1.15 | 14 |
| R1–R2 Link | 2 | 10.10.1.16 | /30 | 255.255.255.252 | R1: .17, R2: .18 | 10.10.1.17 – 10.10.1.18 | 10.10.1.19 | 2 |
| R2–R3 Link | 2 | 10.10.1.20 | /30 | 255.255.255.252 | R2: .21, R3: .22 | 10.10.1.21 – 10.10.1.22 | 10.10.1.23 | 2 |

---

## Calculation Methodology

### VLSM Algorithm (Largest First)

1. **Sort** departments by host requirement descending
2. **Calculate** required prefix for each: `prefix = 32 - ceil(log2(hosts + 2))`
3. **Allocate** from parent network start address
4. **Verify** no overlap and within parent boundary

### Example: Engineering (100 hosts)
- Required: 100 + 2 = 102 addresses
- Next power of 2: 128 (2^7)
- Host bits: 7 → Prefix: /25
- Network: 10.10.0.0/25
- Usable: 128 - 2 = 126 hosts ✓

### Example: R1–R2 Link (2 hosts)
- Required: 2 + 2 = 4 addresses
- Next power of 2: 4 (2^2)
- Host bits: 2 → Prefix: /30
- Network: 10.10.1.16/30
- Usable: 4 - 2 = 2 hosts ✓

---

## Address Space Utilization

```
10.10.0.0/23 (512 total addresses)
├── 10.10.0.0/25      Engineering      (128 addr, 126 usable)
├── 10.10.0.128/26    Administration   (64 addr, 62 usable)
├── 10.10.0.192/27    Finance          (32 addr, 30 usable)
├── 10.10.0.224/27    HR               (32 addr, 30 usable)
├── 10.10.1.0/28      IT Support       (16 addr, 14 usable)
├── 10.10.1.16/30     R1–R2 Link       (4 addr, 2 usable)
├── 10.10.1.20/30     R2–R3 Link       (4 addr, 2 usable)
└── Remaining: 10.10.1.24/29, 10.10.1.32/27, 10.10.1.64/26, 10.10.1.128/25
```

**Total Allocated:** 280 addresses  
**Total Usable:** 266 addresses  
**Utilization:** 266/512 = 52%  
**Reserved for Growth:** 232 addresses (45%)

---

## Verification Checklist

- [ ] All subnets within 10.10.0.0/23 boundary
- [ ] No overlapping subnets
- [ ] Each department meets host requirement
- [ ] Point-to-point links use /30
- [ ] Gateway is first usable address
- [ ] Broadcast is last address in subnet
- [ ] Subnet masks match prefix lengths