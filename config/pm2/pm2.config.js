module.exports = {
    apps: [
        {
            name: 'fubo-api',
            script: 'dist/app.js',
            stop_exit_codes: [0],
            watch: false,
            restart_delay: 200,
            exp_backoff_restart_delay: 100,
            combine_logs: true,
            merge_logs: true,
            error_file: 'dist/logs/err.log',
            out_file: 'dist/logs/out.log',
            time: true,
            instances: 2, // limit to two instances
            exec_mode: 'cluster',
            env: {
                'PORT': 8080
            }
        }
    ]
}