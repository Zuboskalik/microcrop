<?php

namespace App\Services;

/**
 * Формирование ссылки на оплату Robokassa и проверка подписи входящего
 * callback'а (ResultURL). См. ARCHITECTURE.md §6.1/§6.2.
 */
class RobokassaService
{
    public function __construct(
        private readonly string $merchantLogin,
        private readonly string $password1,
        private readonly string $password2,
        private readonly string $baseUrl,
        private readonly bool $isTest,
    ) {
    }

    public static function fromConfig(): self
    {
        return new self(
            merchantLogin: (string) config('robokassa.merchant_login'),
            password1: (string) config('robokassa.password1'),
            password2: (string) config('robokassa.password2'),
            baseUrl: (string) config('robokassa.base_url'),
            isTest: (bool) config('robokassa.is_test'),
        );
    }

    /**
     * Формирует URL оплаты Robokassa с подписью
     * MD5(MerchantLogin:OutSum:InvId:Password1).
     */
    public function buildPaymentUrl(int $invId, float $outSum, string $description, ?string $email = null): string
    {
        $outSumFormatted = $this->formatSum($outSum);

        $signature = md5(sprintf(
            '%s:%s:%d:%s',
            $this->merchantLogin,
            $outSumFormatted,
            $invId,
            $this->password1,
        ));

        $params = array_filter([
            'MerchantLogin' => $this->merchantLogin,
            'OutSum' => $outSumFormatted,
            'InvId' => $invId,
            'Description' => $description,
            'SignatureValue' => $signature,
            'Email' => $email,
            'IsTest' => $this->isTest ? 1 : 0,
            'Culture' => 'ru',
        ], static fn ($value) => $value !== null && $value !== '');

        return $this->baseUrl.'?'.http_build_query($params);
    }

    /**
     * Проверяет подпись входящего ResultURL-запроса:
     * MD5(OutSum:InvId:Password2) должен совпасть с SignatureValue.
     */
    public function verifyCallbackSignature(string $outSum, int|string $invId, string $signatureValue): bool
    {
        $expected = md5(sprintf('%s:%s:%s', $outSum, $invId, $this->password2));

        return hash_equals(strtolower($expected), strtolower($signatureValue));
    }

    private function formatSum(float $outSum): string
    {
        return number_format($outSum, 2, '.', '');
    }
}
