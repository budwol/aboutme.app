const fs = require("fs");

function trim(value) {
  return value.trim();
}

function parseEnvValue(rawValue) {
  const value = trim(rawValue);

  if (value.startsWith('"') && value.endsWith('"')) {
    return value
      .slice(1, -1)
      .replace(/\\n/g, "\n")
      .replace(/\\r/g, "\r")
      .replace(/\\t/g, "\t")
      .replace(/\\"/g, '"');
  }

  if (value.startsWith("'") && value.endsWith("'")) {
    return value.slice(1, -1);
  }

  return value;
}

function parseEnvText(content, sourceLabel = ".env") {
  const values = {};
  const lines = content.split(/\r?\n/);

  for (let index = 0; index < lines.length; index += 1) {
    const lineNumber = index + 1;
    let line = trim(lines[index] ?? "");

    if (!line || line.startsWith("#")) {
      continue;
    }

    if (line.startsWith("export ")) {
      line = trim(line.slice("export ".length));
    }

    const separatorIndex = line.indexOf("=");
    if (separatorIndex < 0) {
      throw new Error(`Invalid env entry in ${sourceLabel}:${lineNumber}`);
    }

    const key = trim(line.slice(0, separatorIndex));
    const rawValue = line.slice(separatorIndex + 1);

    if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(key)) {
      throw new Error(
        `Invalid env key '${key}' in ${sourceLabel}:${lineNumber}`,
      );
    }

    values[key] = parseEnvValue(rawValue);
  }

  return values;
}

function parseEnvFile(filePath) {
  return parseEnvText(fs.readFileSync(filePath, "utf8"), filePath);
}

function writeNullSeparatedPairs(values) {
  for (const [key, value] of Object.entries(values)) {
    process.stdout.write(`${key}\0${value}\0`);
  }
}

module.exports = {
  parseEnvFile,
  parseEnvText,
  parseEnvValue,
};

if (require.main === module) {
  const filePath = process.argv[2];

  if (!filePath) {
    console.error("Missing env file path.");
    process.exit(1);
  }

  try {
    writeNullSeparatedPairs(parseEnvFile(filePath));
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}
