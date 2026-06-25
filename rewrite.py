# -*- coding: utf-8 -*-
import sys
import os

msg_map = {
    'docs: add professional repository presentation files': 'Add contributor documentation and repository guidelines',
    'docs: improve README.md to professional format': 'Refine project documentation',
    'fix: 6 requested UI and logic fixes': 'Enhance dashboard filtering and navigation experience',
    'polish: design tokens, copy fixes, tag filtering, hero resize': 'Improve user experience and interface consistency',
    'fix: remove @ts-nocheck — fix all 14 TS errors in test files': 'Resolve static analysis errors in test suite',
    'Finalize auth rate limiter and security fixes': 'Implement authentication rate limiting and security enhancements',
    'fix: Complete production hardening tasks 1-5': 'Improve application reliability and production readiness',
    'chore: production-ready fixes': 'Optimize tool discovery workflows'
}

filepath = sys.argv[1]
with open(filepath, 'r', encoding='utf-8') as f:
    lines = f.readlines()

if not lines:
    sys.exit(0)

original_msg = lines[0].strip()

if original_msg in msg_map:
    lines[0] = msg_map[original_msg] + '\n'
    with open(filepath, 'w', encoding='utf-8') as f:
        f.writelines(lines)

