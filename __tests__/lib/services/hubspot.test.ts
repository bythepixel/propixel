import {
    createHubspotDeal,
    updateHubspotDeal,
    findOrCreateHubspotCompany,
    findOrCreateHubspotContact
} from '../../../lib/services/hubspot';

const mockCreateDeal = jest.fn();
const mockUpdateDeal = jest.fn();
const mockSearchCompany = jest.fn();
const mockCreateCompany = jest.fn();
const mockSearchContact = jest.fn();
const mockCreateContact = jest.fn();

// Use the mock variables directly since they are prefixed with 'mock'
jest.mock('@hubspot/api-client', () => {
    return {
        Client: jest.fn().mockImplementation(() => ({
            crm: {
                deals: {
                    basicApi: {
                        create: jest.fn((...args) => mockCreateDeal(...args)),
                        update: jest.fn((...args) => mockUpdateDeal(...args)),
                    },
                },
                companies: {
                    searchApi: {
                        doSearch: jest.fn((...args) => mockSearchCompany(...args)),
                    },
                    basicApi: {
                        create: jest.fn((...args) => mockCreateCompany(...args)),
                    },
                },
                contacts: {
                    searchApi: {
                        doSearch: jest.fn((...args) => mockSearchContact(...args)),
                    },
                    basicApi: {
                        create: jest.fn((...args) => mockCreateContact(...args)),
                    },
                },
            },
        })),
        AssociationSpecAssociationCategoryEnum: { HubspotDefined: 'HUBSPOT_DEFINED' },
        FilterOperatorEnum: { Eq: 'EQ' }
    };
});

describe('HubSpot Service', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('createHubspotDeal', () => {
        it('should call HubSpot API to create a deal', async () => {
            mockCreateDeal.mockResolvedValue({ id: 'deal_123' });
            const result = await createHubspotDeal('Test Proposal', 1000, 'company_123');
            expect(result.id).toBe('deal_123');
        });
    });

    describe('findOrCreateHubspotCompany', () => {
        it('should return existing company if found by domain', async () => {
            mockSearchCompany.mockResolvedValue({ results: [{ id: 'comp_existing' }] });
            const result = await findOrCreateHubspotCompany('Acme', 'acme.com');
            expect(result.id).toBe('comp_existing');
        });
    });
});
