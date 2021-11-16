<?php

declare(strict_types=1);

namespace Akeneo\Connectivity\Connection\Infrastructure\Marketplace;

use Akeneo\Connectivity\Connection\Domain\Apps\Persistence\Query\GetAllConnectedAppsPublicIdsInterface;
use Akeneo\Connectivity\Connection\Domain\Marketplace\DTO\GetAllAppsResult;
use Akeneo\Connectivity\Connection\Domain\Marketplace\GetAllAppsQueryInterface;
use Akeneo\Connectivity\Connection\Domain\Marketplace\Model\App;

/**
 * @copyright 2021 Akeneo SAS (http://www.akeneo.com)
 * @license   http://opensource.org/licenses/osl-3.0.php  Open Software License (OSL 3.0)
 */
final class GetAllAppsQuery implements GetAllAppsQueryInterface
{
    private const MAX_REQUESTS = 10;

    private WebMarketplaceApiInterface $webMarketplaceApi;
    private GetAllConnectedAppsPublicIdsInterface $allConnectedAppsPublicIdsQuery;
    private int $pagination;

    public function __construct(
        WebMarketplaceApiInterface $webMarketplaceApi,
        GetAllConnectedAppsPublicIdsInterface $allConnectedAppsPublicIdsQuery,
        int $pagination
    ) {
        $this->webMarketplaceApi = $webMarketplaceApi;
        $this->allConnectedAppsPublicIdsQuery = $allConnectedAppsPublicIdsQuery;
        $this->pagination = $pagination;
    }

    public function execute(): GetAllAppsResult
    {
        $apps = [];
        $requests = 0;
        $offset = 0;

        $connectedAppsIds = $this->allConnectedAppsPublicIdsQuery->execute();

        do {
            $result = $this->webMarketplaceApi->getApps($offset, $this->pagination);
            $requests++;
            $offset += $result['limit'];

            foreach ($result['items'] as $item) {
                $item['connected'] = in_array($item['id'], $connectedAppsIds, true);
                $apps[] = App::fromWebMarketplaceValues($item);
            }
        } while (count($result['items']) > 0 && count($apps) < $result['total'] && $requests < self::MAX_REQUESTS);

        return GetAllAppsResult::create($result['total'], $apps);
    }
}
