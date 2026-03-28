import * as vscode from 'vscode'
import * as path from 'path'

export function activate(context: vscode.ExtensionContext): void {
  const serverPath = path.join(context.extensionPath, 'dist', 'server.js')
  const outputChannel = vscode.window.createOutputChannel('SonarQube MCP')
  context.subscriptions.push(outputChannel)

  outputChannel.appendLine('SonarQube MCP extension activated')

  // Register MCP server definition provider
  const provider: vscode.McpServerDefinitionProvider = {
    provideMcpServerDefinitions(_token: vscode.CancellationToken) {
      const config = vscode.workspace.getConfiguration('sonarqubeMcp')
      const env = buildEnvFromConfig(config)

      return [
        new vscode.McpStdioServerDefinition(
          'SonarQube MCP',
          process.execPath,
          [serverPath],
          env,
          context.extension.packageJSON.version,
        ),
      ]
    },
  }

  context.subscriptions.push(
    vscode.lm.registerMcpServerDefinitionProvider('sonarqube-mcp', provider),
  )

  // Watch for config changes
  context.subscriptions.push(
    vscode.workspace.onDidChangeConfiguration((e) => {
      if (e.affectsConfiguration('sonarqubeMcp')) {
        vscode.window.showInformationMessage(
          'SonarQube MCP configuration changed. Restart the MCP server for changes to take effect.',
        )
      }
    }),
  )
}

export function deactivate(): void {}

function buildEnvFromConfig(config: vscode.WorkspaceConfiguration): Record<string, string> {
  const env: Record<string, string> = {}

  const baseUrl = config.get<string>('baseUrl')
  if (baseUrl) env['SONAR_MCP_BASE_URL'] = baseUrl

  const token = config.get<string>('token')
  if (token) env['SONAR_MCP_TOKEN'] = token

  const organization = config.get<string>('organization')
  if (organization) env['SONAR_MCP_ORGANIZATION'] = organization

  const defaultProject = config.get<string>('defaultProject')
  if (defaultProject) env['SONAR_MCP_DEFAULT_PROJECT'] = defaultProject

  const cacheTtlMs = config.get<number>('cacheTtlMs')
  if (cacheTtlMs !== undefined) env['SONAR_MCP_CACHE_TTL_MS'] = String(cacheTtlMs)

  const cacheMaxSize = config.get<number>('cacheMaxSize')
  if (cacheMaxSize !== undefined) env['SONAR_MCP_CACHE_MAX_SIZE'] = String(cacheMaxSize)

  const timeoutMs = config.get<number>('timeoutMs')
  if (timeoutMs !== undefined) env['SONAR_MCP_TIMEOUT_MS'] = String(timeoutMs)

  const pageSize = config.get<number>('pageSize')
  if (pageSize !== undefined) env['SONAR_MCP_PAGE_SIZE'] = String(pageSize)

  return env
}
