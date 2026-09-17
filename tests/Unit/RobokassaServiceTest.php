<?php

namespace Tests\Unit;

use App\Services\RobokassaService;
use PHPUnit\Framework\Attributes\Test;
use Tests\TestCase;

class RobokassaServiceTest extends TestCase
{
    private function makeService(bool $isTest = true): RobokassaService
    {
        return new RobokassaService(
            merchantLogin: 'merchant_x',
            password1: 'pass1',
            password2: 'pass2',
            baseUrl: 'https://auth.robokassa.ru/Merchant/Index.aspx',
            isTest: $isTest,
        );
    }

    #[Test]
    public function build_payment_url_contains_correct_md5_signature(): void
    {
        $service = $this->makeService();

        $url = $service->buildPaymentUrl(invId: 42, outSum: 199.0, description: 'MicroCrop: remove_watermark');

        $expectedSignature = md5('merchant_x:199.00:42:pass1');

        parse_str((string) parse_url($url, PHP_URL_QUERY), $params);

        $this->assertSame('merchant_x', $params['MerchantLogin']);
        $this->assertSame('199.00', $params['OutSum']);
        $this->assertSame('42', $params['InvId']);
        $this->assertSame($expectedSignature, $params['SignatureValue']);
        $this->assertSame('1', $params['IsTest']);
    }

    #[Test]
    public function build_payment_url_omits_is_test_flag_in_production_mode(): void
    {
        $service = $this->makeService(isTest: false);

        $url = $service->buildPaymentUrl(invId: 1, outSum: 10.0, description: 'test');

        parse_str((string) parse_url($url, PHP_URL_QUERY), $params);

        $this->assertSame('0', $params['IsTest']);
    }

    #[Test]
    public function build_payment_url_includes_email_when_provided(): void
    {
        $service = $this->makeService();

        $url = $service->buildPaymentUrl(invId: 1, outSum: 10.0, description: 'test', email: 'user@example.com');

        parse_str((string) parse_url($url, PHP_URL_QUERY), $params);

        $this->assertSame('user@example.com', $params['Email']);
    }

    #[Test]
    public function build_payment_url_omits_email_when_not_provided(): void
    {
        $service = $this->makeService();

        $url = $service->buildPaymentUrl(invId: 1, outSum: 10.0, description: 'test');

        parse_str((string) parse_url($url, PHP_URL_QUERY), $params);

        $this->assertArrayNotHasKey('Email', $params);
    }

    #[Test]
    public function verify_callback_signature_accepts_valid_signature(): void
    {
        $service = $this->makeService();

        $signature = md5('199.00:42:pass2');

        $this->assertTrue($service->verifyCallbackSignature('199.00', 42, $signature));
    }

    #[Test]
    public function verify_callback_signature_is_case_insensitive(): void
    {
        $service = $this->makeService();

        $signature = strtoupper(md5('199.00:42:pass2'));

        $this->assertTrue($service->verifyCallbackSignature('199.00', 42, $signature));
    }

    #[Test]
    public function verify_callback_signature_rejects_invalid_signature(): void
    {
        $service = $this->makeService();

        $this->assertFalse($service->verifyCallbackSignature('199.00', 42, 'deadbeef'));
    }

    #[Test]
    public function verify_callback_signature_rejects_tampered_amount(): void
    {
        $service = $this->makeService();

        $signature = md5('199.00:42:pass2');

        // Подпись рассчитана для 199.00, но пришла сумма 1.00 — должна быть отклонена.
        $this->assertFalse($service->verifyCallbackSignature('1.00', 42, $signature));
    }
}
