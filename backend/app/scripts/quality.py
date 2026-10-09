from __future__ import annotations

import subprocess
import sys


COMMANDS = (
    [sys.executable, "-m", "ruff", "check", "app", "tests"],
    [sys.executable, "-m", "pytest"],
    [
        sys.executable,
        "-m",
        "compileall",
        "-q",
        "app",
        "tests",
        "migrations",
    ],
)


def main() -> None:
    for command in COMMANDS:
        subprocess.run(command, check=True)


if __name__ == "__main__":
    main()
