# Scripts

This section of the code is meant to manually executable scripts, which are not meant to be imported as modules, but rather to be run from the command line as standalone scripts.

## applyDificultyToEachNode.ts

Adds/Updates the difficulty of each node of the database. It reads each records, then assigns a difficulty on each node based on the distance from that node to its municipality. The thresholds for the distances can be seen on this file as constants, they are:

- EASY: ≤ 1000 m
- NORMAL: > 1000 m and ≤ 5000 m
- HARD: > 5000 m

To run the script, use the following command:

```bash
node applyDificultyToEachNode.ts
```
