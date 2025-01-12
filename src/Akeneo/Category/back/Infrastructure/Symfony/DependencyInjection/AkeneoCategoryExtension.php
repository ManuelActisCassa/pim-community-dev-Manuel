<?php

declare(strict_types=1);

namespace Akeneo\Category\Infrastructure\Symfony\DependencyInjection;

use Symfony\Component\Config\FileLocator;
use Symfony\Component\DependencyInjection\ContainerBuilder;
use Symfony\Component\DependencyInjection\Loader\YamlFileLoader;
use Symfony\Component\HttpKernel\DependencyInjection\Extension;

/**
 * This is the class that loads and manages your bundle configuration.
 *
 * @author    Weasels
 * @copyright 2022 Akeneo SAS (http://www.akeneo.com)
 * @license   http://opensource.org/licenses/osl-3.0.php Open Software License (OSL 3.0)
 */
class AkeneoCategoryExtension extends Extension
{
    /**
     * {@inheritdoc}
     */
    public function load(array $configs, ContainerBuilder $container)
    {
        $loader = new YamlFileLoader($container, new FileLocator(__DIR__.'/../Resources/config'));
        $loader->load('cli.yml');
        $loader->load('feature_flags.yml');
        $loader->load('controllers.yml');
        $loader->load('entities.yml');
        $loader->load('forms.yml');
        $loader->load('models.yml');
        $loader->load('normalizers.yml');
        $loader->load('readers.yml');
        $loader->load('repositories.yml');
        $loader->load('serializers_standard.yml');
        $loader->load('serializers_versioning.yml');
    }
}
