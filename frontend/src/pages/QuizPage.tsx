import { useState } from 'react';
import { Container, Title, Text, Stack, Group, Button, Card } from '@mantine/core';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { apiFetch } from '../services/api';
import { BudgetStep } from '../components/quiz/BudgetStep';
import { CommuteStep } from '../components/quiz/CommuteStep';
import { FamilyStep } from '../components/quiz/FamilyStep';
import { PriceIndicator } from '../components/search/PriceIndicator';

interface Recommendation {
  id: string;
  make: string;
  model: string;
  year: number;
  price: number;
  price_indicator: string | null;
  transmission: string;
  fuel_type: string | null;
  body_type: string | null;
  district: string;
  thumbnail_url: string | null;
}

export function QuizPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [step, setStep] = useState(0);
  const [budget, setBudget] = useState(500000);
  const [commute, setCommute] = useState(20);
  const [family, setFamily] = useState(2);
  const [results, setResults] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const steps = [
    <BudgetStep key="budget" value={budget} onChange={setBudget} />,
    <CommuteStep key="commute" value={commute} onChange={setCommute} />,
    <FamilyStep key="family" value={family} onChange={setFamily} />,
  ];

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiFetch<{ recommendations: Recommendation[] }>('/quiz/recommend', {
        method: 'POST',
        body: JSON.stringify({
          budget_max: budget,
          daily_commute_km: commute,
          family_size: family,
        }),
      });
      setResults(data.recommendations);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price: number) =>
    new Intl.NumberFormat('en-EG', { maximumFractionDigits: 0 }).format(price) + ' EGP';

  if (results.length > 0) {
    return (
      <Container size="md" py="xl">
        <Title order={2} mb="lg">{t('quiz.results')}</Title>
        <Stack gap="md">
          {results.map((rec) => (
            <Card
              key={rec.id}
              bg="#12151C"
              p="md"
              radius="md"
              style={{ border: '1px solid #1A1F2B', cursor: 'pointer' }}
              onClick={() => navigate(`/listings/${rec.id}`)}
            >
              <Group justify="space-between" align="flex-start">
                <div>
                  <Text fw={700} size="lg" c="white">{rec.make} {rec.model} {rec.year}</Text>
                  <Text size="sm" c="dimmed">{rec.transmission} · {rec.district}</Text>
                  {rec.body_type && <Text size="sm" c="dimmed">{rec.body_type}</Text>}
                </div>
                <Group>
                  <PriceIndicator indicator={rec.price_indicator as any} />
                  <Text fw={800} size="lg" c="#4DABF7">{formatPrice(rec.price)}</Text>
                </Group>
              </Group>
            </Card>
          ))}
          {results.length === 0 && (
            <Text c="dimmed" ta="center" py="xl">{t('quiz.noMatches')}</Text>
          )}
        </Stack>
        <Group justify="center" mt="lg">
          <Button variant="default" onClick={() => setResults([])}>
            {t('common.back')}
          </Button>
        </Group>
      </Container>
    );
  }

  return (
    <Container size="sm" py="xl">
      <Title order={2} mb="lg" ta="center">{t('quiz.title')}</Title>

      <Stack gap="xl" align="center" maw={500} mx="auto">
        {steps[step]}
      </Stack>

      <Group justify="space-between" mt="xl">
        <Button
          variant="default"
          disabled={step === 0}
          onClick={() => setStep((s) => s - 1)}
        >
          {t('common.back')}
        </Button>

        {step < steps.length - 1 ? (
          <Button onClick={() => setStep((s) => s + 1)}>{t('common.next')}</Button>
        ) : (
          <Button loading={loading} onClick={handleSubmit}>{t('common.submit')}</Button>
        )}
      </Group>

      {error && <Text c="red" ta="center" mt="md">{error}</Text>}
    </Container>
  );
}