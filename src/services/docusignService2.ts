import api from './api';

export interface SendForSignatureRequest {
    quoteId: number;
    managerName: string;
    managerEmail: string;
    managerTitle: string;
    clientName: string;
    clientEmail: string;
}

export interface SendForSignatureResponse {
    success: boolean;
    envelopeId: string;
    message: string;
    timestamp: string;
}

export const sendQuoteForSignature = async (
    request: SendForSignatureRequest
): Promise<SendForSignatureResponse> => {
    const response = await api.post<SendForSignatureResponse>(
        '/api/v1/docusign/send-quote',
        request
    );
    return response.data;
};