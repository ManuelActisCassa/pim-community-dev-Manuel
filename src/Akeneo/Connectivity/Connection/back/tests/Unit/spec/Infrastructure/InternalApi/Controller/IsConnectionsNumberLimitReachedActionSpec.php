<?php

declare(strict_types=1);

namespace spec\Akeneo\Connectivity\Connection\Infrastructure\InternalApi\Controller;

use Akeneo\Connectivity\Connection\Application\Settings\Query\IsConnectionsNumberLimitReachedHandler;
use Akeneo\Connectivity\Connection\Infrastructure\InternalApi\Controller\IsConnectionsNumberLimitReachedAction;
use PhpSpec\ObjectBehavior;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\RedirectResponse;
use Symfony\Component\HttpFoundation\Request;

/**
 * @copyright 2021 Akeneo SAS (http://www.akeneo.com)
 * @license   http://opensource.org/licenses/osl-3.0.php  Open Software License (OSL 3.0)
 */
class IsConnectionsNumberLimitReachedActionSpec extends ObjectBehavior
{
    public function let(IsConnectionsNumberLimitReachedHandler $isConnectionsNumberLimitReachedHandler)
    {
        $this->beConstructedWith($isConnectionsNumberLimitReachedHandler);
    }

    public function it_is_initializable(): void
    {
        $this->shouldBeAnInstanceOf(IsConnectionsNumberLimitReachedAction::class);
    }

    public function it_redirects_on_missing_xmlhttprequest_header(Request $request): void
    {

        $this->__invoke($request)->shouldBeLike(new RedirectResponse('/'));
    }

    public function it_returns_limit_reached_flag(
        IsConnectionsNumberLimitReachedHandler $isConnectionsNumberLimitReachedHandler,
        Request $request
    ): void {
        $request->isXmlHttpRequest()->willReturn(true);
        $isConnectionsNumberLimitReachedHandler->execute()->willReturn(true);

        $this->__invoke($request)->shouldBeLike(new JsonResponse(['limitReached' => true]));
    }
}
