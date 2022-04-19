import React, {FC, useCallback, useEffect, useState} from 'react';
import {useHistory} from 'react-router';
import {AppWizardData} from '../../../model/Apps/wizard-data';
import {PermissionsByProviderKey} from '../../../model/Apps/permissions-by-provider-key';
import {PermissionFormProvider, usePermissionFormRegistry} from '../../../shared/permission-form-registry';
import {useFetchAppWizardData} from '../../hooks/use-fetch-app-wizard-data';
import {Authentication} from './steps/Authentication/Authentication';
import {Authorizations} from './steps/Authorizations';
import {Step, WizardModal} from './WizardModal';
import {FullScreenLoader} from './FullScreenLoader';
import {useConfirmHandler} from '../../hooks/use-confirm-handler';
import {useFeatureFlags} from '../../../shared/feature-flags';
import {Permissions} from './steps/Permissions';

interface Props {
    clientId: string;
}

export const AppWizard: FC<Props> = ({clientId}) => {
    const featureFlags = useFeatureFlags();
    const history = useHistory();
    const [wizardData, setWizardData] = useState<AppWizardData | null>(null);
    const fetchWizardData = useFetchAppWizardData(clientId);
    const [steps, setSteps] = useState<Step[]>([]);
    const [authenticationScopesConsentGiven, setAuthenticationScopesConsent] = useState<boolean>(false);

    const permissionFormRegistry = usePermissionFormRegistry();
    const [providers, setProviders] = useState<PermissionFormProvider<any>[]>([]);
    const [permissions, setPermissions] = useState<PermissionsByProviderKey>({});

    useEffect(() => {
        permissionFormRegistry.all().then(providers => setProviders(providers));
    }, []);

    useEffect(() => {
        fetchWizardData().then(wizardData => {
            const steps: Step[] = [];

            const supportsPermissions = true === featureFlags.isEnabled('connect_app_with_permissions');
            const requiresAuthentication = wizardData.authenticationScopes.length > 0;
            const isAlreadyConnected = wizardData.oldScopeMessages !== null;
            const hasAlreadyConsented =
                !!wizardData.oldAuthenticationScopes && wizardData.oldAuthenticationScopes.length > 0;

            if (requiresAuthentication) {
                steps.push({
                    name: 'authentication',
                    requires_explicit_approval: true,
                });
            }

            steps.push({
                name: 'authorizations',
                requires_explicit_approval: true,
            });

            if (!isAlreadyConnected && supportsPermissions) {
                steps.push({
                    name: 'permissions',
                    requires_explicit_approval: false,
                });
            }

            setSteps(steps);
            setWizardData(wizardData);
            setAuthenticationScopesConsent(hasAlreadyConsented);
        });
    }, [fetchWizardData]);

    const redirectToMarketplace = useCallback(() => {
        history.push('/connect/app-store');
    }, [history]);

    const handleSetProviderPermissions = useCallback(
        (providerKey: string, providerPermissions: object) => {
            setPermissions(state => ({...state, [providerKey]: providerPermissions}));
        },
        [setPermissions]
    );

    const permissionsAreEditable = steps.find(step => step.name === 'permissions') !== undefined;

    // @todo rethink useConfirmHandler signature
    const {confirm, processing} = useConfirmHandler(
        clientId,
        permissionsAreEditable ? providers : [],
        permissionsAreEditable ? permissions : {}
    );

    if (wizardData === null) {
        return null;
    }

    if (processing) {
        return <FullScreenLoader />;
    }

    const hasAlreadyConsented = !!wizardData.oldAuthenticationScopes && wizardData.oldAuthenticationScopes.length > 0;
    const userConsentRequired = wizardData.authenticationScopes.length !== 0 && !authenticationScopesConsentGiven;

    return (
        <WizardModal
            appLogo={wizardData.appLogo}
            appName={wizardData.appName}
            onClose={redirectToMarketplace}
            onConfirm={confirm}
            steps={steps}
            maxAllowedStep={userConsentRequired && !hasAlreadyConsented ? 'authentication' : null}
        >
            {step => (
                <>
                    {step.name === 'authentication' && (
                        <Authentication
                            appName={wizardData.appName}
                            scopes={wizardData.authenticationScopes}
                            oldScopes={wizardData.oldAuthenticationScopes}
                            appUrl={wizardData.appUrl}
                            skipConsent={hasAlreadyConsented}
                            scopesConsentGiven={authenticationScopesConsentGiven}
                            setScopesConsent={setAuthenticationScopesConsent}
                        />
                    )}
                    {step.name === 'authorizations' && (
                        <Authorizations
                            appName={wizardData.appName}
                            scopeMessages={wizardData.scopeMessages}
                            oldScopeMessages={wizardData.oldScopeMessages}
                        />
                    )}
                    {step.name === 'permissions' && (
                        <Permissions
                            appName={wizardData.appName}
                            providers={providers}
                            setProviderPermissions={handleSetProviderPermissions}
                            permissions={permissions}
                        />
                    )}
                </>
            )}
        </WizardModal>
    );
};
