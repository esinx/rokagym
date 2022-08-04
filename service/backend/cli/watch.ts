import { ChildProcessWithoutNullStreams, spawn } from 'child_process'

import chalk from 'chalk'
import chokidar from 'chokidar'
import { build } from 'esbuild'
import path from 'node:path'

const log = (str: string) =>
	console.log(`${chalk.green('[cinnamon-watcher]')} ${str}`)

const debounced = <T extends () => void>(
	callback: T,
	limit = 100,
): (() => void) => {
	let timeout: NodeJS.Timeout
	return () => {
		clearTimeout(timeout)
		timeout = setTimeout(() => callback(), limit)
	}
}

let forkedNodeProcess: ChildProcessWithoutNullStreams

const refresh = debounced(async () => {
	log(`✨Re-building bundle with esbuild`)
	const res = await build({
		entryPoints: [path.resolve(__dirname, '../', 'src', 'listen.ts')],
		bundle: true,
		platform: 'node',
		outdir: path.resolve(__dirname, '../', 'build'),
		external: ['bcrypt'],
	})
	if (res.errors.length) {
		log(
			`${chalk.redBright(
				'ERROR!',
			)} The following error(s) occurred while bundling:`,
		)
		res.errors.forEach((error) => console.error(error))
	}
	if (forkedNodeProcess) {
		log(`🛑 Stopping previous node process...`)
		forkedNodeProcess.kill('SIGINT')
	}
	log(`🔁 Restarting node process...`)
	forkedNodeProcess = spawn('node', ['build/listen.js'], {
		cwd: path.resolve(__dirname, '../'),
		stdio: 'pipe',
	})
	forkedNodeProcess.stdout.on('data', (buff) => {
		const line = buff.toLocaleString()
		console.info(`${chalk.gray(`[node:${forkedNodeProcess.pid}]`)}  ${line}`)
	})
	forkedNodeProcess.stderr.on('data', (buff) => {
		const line = buff.toLocaleString()
		console.error(`${chalk.gray(`[node:${forkedNodeProcess.pid}]`)}  ${line}`)
	})
	log(
		`🚀 ${chalk.blueBright(`Now up and running!`)} (pid: ${
			forkedNodeProcess.pid
		})`,
	)
}, 1000)

const watcher = chokidar.watch([path.resolve(__dirname, '../', 'src/')], {
	ignored: /(^|[\/\\])\../, // ignore dotfiles
	persistent: true,
})

watcher
	.on('add', (_path) => {
		log(`🆕 File ${_path?.split('/').at(-1)} has been added`)
		refresh()
	})
	.on('change', (_path) => {
		log(`💾 File ${_path?.split('/').at(-1)} has been changed`)
		refresh()
	})
	.on('unlink', (_path) => {
		log(`🗑️ File ${_path?.split('/').at(-1)} has been removed`)
		refresh()
	})

process.on('SIGINT', () => {
	forkedNodeProcess?.kill()
})
