import React, { useState } from 'react';
import { Button, Modal, Form, Input, message } from 'antd';
import { FileTextOutlined, LoadingOutlined } from '@ant-design/icons';
import axios from 'axios';

interface SendForSignatureButtonProps {
    quoteId: number;
    disabled?: boolean;
    onSuccess?: (envelopeId: string) => void;
}

export const SendForSignatureButton: React.FC<SendForSignatureButtonProps> = ({
                                                                                  quoteId,
                                                                                  disabled = false,
                                                                                  onSuccess
                                                                              }) => {
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [form] = Form.useForm();

    const showModal = () => {
        setIsModalVisible(true);
    };

    const handleCancel = () => {
        setIsModalVisible(false);
        form.resetFields();
    };

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();
            setIsLoading(true);

            // DIRECT API CALL - NO SERVICE LAYER
            const response = await axios.post('http://localhost:8080/api/v1/docusign/send-quote', {
                quoteId: quoteId,
                managerName: values.managerName,
                managerEmail: values.managerEmail,
                managerTitle: values.managerTitle,
                clientName: values.clientName,
                clientEmail: values.clientEmail
            });

            message.success({
                content: `Quote sent for signature! Envelope ID: ${response.data.envelopeId}`,
                duration: 5
            });

            setIsModalVisible(false);
            form.resetFields();

            if (onSuccess) {
                onSuccess(response.data.envelopeId);
            }
        } catch (error: any) {
            console.error('DocuSign error:', error);
            message.error(error.response?.data?.message || error.message || 'Failed to send for signature');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <Button
                type="primary"
                icon={<FileTextOutlined />}
                onClick={showModal}
                disabled={disabled}
                className="w-100 mb-2"
            >
                Send for Signature
            </Button>

            <Modal
                title="Send Quote for Digital Signature"
                open={isModalVisible}
                onCancel={handleCancel}
                width={600}
                footer={[
                    <Button key="cancel" onClick={handleCancel} disabled={isLoading}>
                        Cancel
                    </Button>,
                    <Button
                        key="submit"
                        type="primary"
                        onClick={handleSubmit}
                        loading={isLoading}
                        icon={isLoading ? <LoadingOutlined /> : <FileTextOutlined />}
                    >
                        {isLoading ? 'Sending...' : 'Send for Signature'}
                    </Button>
                ]}
            >
                <Form
                    form={form}
                    layout="vertical"
                    initialValues={{
                        managerTitle: 'Operations Manager'
                    }}
                >
                    <div style={{ marginBottom: 24, padding: 16, background: '#f5f5f5', borderRadius: 8 }}>
                        <h4 style={{ marginTop: 0, color: '#1890ff' }}>Manager Information</h4>

                        <Form.Item
                            label="Manager Name"
                            name="managerName"
                            rules={[{ required: true, message: 'Manager name is required' }]}
                        >
                            <Input placeholder="e.g., John Smith" />
                        </Form.Item>

                        <Form.Item
                            label="Manager Email"
                            name="managerEmail"
                            rules={[
                                { required: true, message: 'Manager email is required' },
                                { type: 'email', message: 'Invalid email format' }
                            ]}
                        >
                            <Input placeholder="e.g., john.smith@erha.co.za" />
                        </Form.Item>

                        <Form.Item
                            label="Manager Title"
                            name="managerTitle"
                            rules={[{ required: true, message: 'Manager title is required' }]}
                        >
                            <Input placeholder="e.g., Operations Manager" />
                        </Form.Item>
                    </div>

                    <div style={{ marginBottom: 0, padding: 16, background: '#fff7e6', borderRadius: 8 }}>
                        <h4 style={{ marginTop: 0, color: '#fa8c16' }}>Client Information</h4>

                        <Form.Item
                            label="Client Name"
                            name="clientName"
                            rules={[{ required: true, message: 'Client name is required' }]}
                        >
                            <Input placeholder="e.g., ABC Construction Ltd" />
                        </Form.Item>

                        <Form.Item
                            label="Client Email"
                            name="clientEmail"
                            rules={[
                                { required: true, message: 'Client email is required' },
                                { type: 'email', message: 'Invalid email format' }
                            ]}
                            style={{ marginBottom: 0 }}
                        >
                            <Input placeholder="e.g., contact@abcconstruction.co.za" />
                        </Form.Item>
                    </div>
                </Form>

                <div style={{ marginTop: 16, padding: 12, background: '#e6f7ff', borderRadius: 8, fontSize: 12 }}>
                    <strong>Note:</strong> Both the manager and client will receive signature request emails from DocuSign.
                </div>
            </Modal>
        </>
    );
};

export default SendForSignatureButton;