import { Client } from '@hubspot/api-client';
import { AssociationSpecAssociationCategoryEnum, FilterOperatorEnum } from '@hubspot/api-client/lib/codegen/crm/deals';
import { FilterOperatorEnum as CompanyFilterOperatorEnum } from '@hubspot/api-client/lib/codegen/crm/companies';

const hubspotClient = new Client({
    accessToken: process.env.HUBSPOT_ACCESS_TOKEN,
});

/**
 * Creates a HubSpot Deal linked to a ProPixel Proposal.
 */
export const createHubspotDeal = async (title: string, amount?: number, companyId?: string) => {
    try {
        const dealProperties = {
            dealname: title,
            amount: amount?.toString() || '0',
            dealstage: 'appointmentscheduled', // Default initial stage
            pipeline: 'default',
        };

        const response = await hubspotClient.crm.deals.basicApi.create({
            properties: dealProperties,
            associations: companyId ? [{
                to: { id: companyId },
                types: [{
                    associationCategory: AssociationSpecAssociationCategoryEnum.HubspotDefined,
                    associationTypeId: 5
                }] // Deal to Company
            }] : [],
        });

        return response;
    } catch (e: any) {
        console.error('Error creating HubSpot Deal:', e.response?.body || e.message);
        throw new Error('Failed to create HubSpot Deal');
    }
};

/**
 * Updates an existing HubSpot Deal with new pricing or status.
 */
export const updateHubspotDeal = async (dealId: string, properties: Record<string, string>) => {
    try {
        const response = await hubspotClient.crm.deals.basicApi.update(dealId, {
            properties,
        });
        return response;
    } catch (e: any) {
        console.error('Error updating HubSpot Deal:', e.response?.body || e.message);
        throw new Error('Failed to update HubSpot Deal');
    }
};

/**
 * Find or Create a HubSpot Company based on name/domain.
 */
export const findOrCreateHubspotCompany = async (name: string, domain?: string) => {
    try {
        // Search for existing company by domain first
        if (domain) {
            const searchResponse = await hubspotClient.crm.companies.searchApi.doSearch({
                filterGroups: [{
                    filters: [{
                        propertyName: 'domain',
                        operator: CompanyFilterOperatorEnum.Eq,
                        value: domain
                    }]
                }]
            });

            if (searchResponse.results.length > 0) {
                return searchResponse.results[0];
            }
        }

        // Create if not found
        const createResponse = await hubspotClient.crm.companies.basicApi.create({
            properties: {
                name,
                domain: domain || '',
            }
        });

        return createResponse;
    } catch (e: any) {
        console.error('Error in findOrCreateHubspotCompany:', e.response?.body || e.message);
        throw new Error('Failed to manage HubSpot Company');
    }
};

/**
 * Find or Create a HubSpot Contact based on email.
 */
export const findOrCreateHubspotContact = async (firstName: string, lastName: string, email: string, companyId?: string) => {
    try {
        // Search for existing contact by email
        const searchResponse = await hubspotClient.crm.contacts.searchApi.doSearch({
            filterGroups: [{
                filters: [{
                    propertyName: 'email',
                    operator: FilterOperatorEnum.Eq,
                    value: email
                }]
            }]
        });

        if (searchResponse.results.length > 0) {
            return searchResponse.results[0];
        }

        // Create if not found
        const createResponse = await hubspotClient.crm.contacts.basicApi.create({
            properties: {
                firstname: firstName,
                lastname: lastName,
                email: email,
            },
            associations: companyId ? [{
                to: { id: companyId },
                types: [{
                    associationCategory: AssociationSpecAssociationCategoryEnum.HubspotDefined,
                    associationTypeId: 1 // Contact to Company
                }]
            }] : [],
        });

        return createResponse;
    } catch (e: any) {
        console.error('Error in findOrCreateHubspotContact:', e.response?.body || e.message);
        throw new Error('Failed to manage HubSpot Contact');
    }
};
