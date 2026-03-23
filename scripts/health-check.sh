#!/bin/bash
curl -s ${1:-http://localhost:5000}/api/health
