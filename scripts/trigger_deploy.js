const { execSync } = require('child_process');

const phpCode = `<?php
require '/var/www/html/vendor/autoload.php';
$app = require_once '/var/www/html/bootstrap/app.php';
$kernel = $app->make(Illuminate\\Contracts\\Console\\Kernel::class);
$kernel->bootstrap();

$target = \\App\\Models\\Application::where('uuid', 'db18zerhhbxaho576mm2ggxj')->first();
$depUuid = (string) \\Illuminate\\Support\\Str::uuid();
$res = queue_application_deployment(
    application: $target,
    deployment_uuid: $depUuid,
    force_rebuild: true
);
echo json_encode($res) . PHP_EOL;
`;

require('fs').writeFileSync('temp_trigger.php', phpCode, 'utf8');

try {
  execSync('scp temp_trigger.php root@187.124.32.121:/tmp/trigger_deploy.php', { stdio: 'inherit' });
  const out = execSync('ssh root@187.124.32.121 "docker cp /tmp/trigger_deploy.php coolify:/var/www/html/trigger_deploy.php && docker exec coolify php /var/www/html/trigger_deploy.php && docker exec coolify rm /var/www/html/trigger_deploy.php && rm /tmp/trigger_deploy.php"', { encoding: 'utf8' });
  console.log('Deployment Result:', out);
} catch (e) {
  console.error(e.message);
} finally {
  require('fs').unlinkSync('temp_trigger.php');
}
