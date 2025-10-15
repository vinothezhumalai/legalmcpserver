# Legal MCP Server

A Model Context Protocol (MCP) server for legal document analysis, providing AI-powered summarization and classification of legal documents across 8 major areas of law.

## Features

- **Document Summarization**: Extract key facts, legal issues, holdings, and reasoning from legal documents
- **Legal Classification**: Classify documents into 8 legal areas with confidence scores
- **Multi-Area Analysis**: Support for Contract, Tax, Constitutional, Property, Tort, Securities, Criminal, and Administrative Law
- **Thomson Reuters LLM Integration**: Configured for Thomson Reuters' internal LLM infrastructure

## Legal Areas Covered

1. **Contract Law** - Agreements, breaches, performance, remedies
2. **Tax Law** - Taxation, IRS matters, compliance, disputes  
3. **Constitutional Law** - Constitutional rights, government powers, judicial review
4. **Property Law** - Real estate, ownership, transfers, zoning
5. **Tort Law** - Personal injury, negligence, damages
6. **Securities Law** - Investment securities, SEC regulations, fraud
7. **Criminal Law** - Criminal charges, prosecution, defense
8. **Administrative Law** - Government agencies, regulations, procedures

## Installation

```bash
# Clone the repository
git clone https://github.com/vinothezhumalai/legalmcpserver.git
cd legalmcpserver

# Install dependencies
npm install

# Build the project
npm run build
```

## Configuration

Copy `.env.example` to `.env` and configure:

```bash
cp .env.example .env
```

The server is pre-configured for Thomson Reuters infrastructure:
- Base URL: `https://litellm.int.thomsonreuters.com`
- Model: `anthropic/claude-sonnet-4-20250514`

## Usage

### Running the MCP Server

```bash
# Development mode
npm run dev

# Production mode
npm run build && npm start
```

### MCP Tools Available

#### 1. `summarize_legal_document`
Generates comprehensive legal summaries including:
- Executive summary
- Key facts
- Legal issues
- Court holdings
- Legal reasoning
- Relevant precedents

**Input:**
```json
{
  "document": {
    "content": "Legal document text...",
    "title": "Case Title",
    "caseNumber": "2023-CV-1234",
    "jurisdiction": "Superior Court",
    "date": "2023-06-15"
  },
  "options": {
    "maxLength": 500,
    "includeKeyFacts": true,
    "includeHolding": true,
    "includeReasoning": true,
    "includeCitations": false
  }
}
```

#### 2. `classify_legal_document`
Classifies documents into legal areas with confidence scores:

**Input:**
```json
{
  "document": {
    "content": "Legal document text...",
    "title": "Document Title"
  },
  "options": {
    "confidenceThreshold": 0.7,
    "includeSubcategories": true,
    "multiLabel": false
  }
}
```

#### 3. `analyze_legal_document_full`
Performs both summarization and classification in one call.

### Sample Legal Scenarios

The server includes 8 diverse legal scenarios for testing, accessible via the resource `legal://sample-scenarios`.

## Integration with Claude Code

Add to your MCP configuration:

```json
{
  "mcpServers": {
    "legal-analyzer": {
      "command": "node",
      "args": ["dist/index.js"],
      "cwd": "/path/to/legalmcpserver"
    }
  }
}
```

## API Response Format

### Summarization Response
```json
{
  "summary": "Executive summary text...",
  "keyFacts": ["Fact 1", "Fact 2"],
  "legalIssues": ["Issue 1", "Issue 2"],
  "holding": "Court's decision...",
  "reasoning": "Legal reasoning...",
  "precedents": ["Case 1", "Case 2"],
  "wordCount": 245
}
```

### Classification Response
```json
{
  "primaryArea": "Contract Law",
  "confidence": 0.92,
  "secondaryAreas": [
    {
      "area": "Tort Law",
      "confidence": 0.35
    }
  ],
  "subcategories": ["Breach of Contract", "Damages"],
  "reasoning": "Document discusses breach of construction contract..."
}
```

## Development

```bash
# Install dependencies
npm install

# Run in development mode
npm run dev

# Build for production
npm run build

# Run tests (if available)
npm test
```

## Security

- API keys are configured through environment variables
- All inputs are validated using Zod schemas
- Error handling prevents sensitive information leakage

## License

MIT License - see LICENSE file for details.