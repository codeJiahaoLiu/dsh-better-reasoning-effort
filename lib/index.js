/**
 * Host half of the dsh-better-reasoning-effort plugin.
 *
 * The whole feature lives in the browser: the Host row exists so the Cordis
 * Loader can mount the package, while the Web module graph finds the client
 * bundle through `package.json`'s `dsh.client` declaration.
 */
export function apply() {}
