import ResultsClient from './ResultsClient';

// Static generation for export
export async function generateStaticParams() {
  return [
    { id: 'demo' },
    { id: 'counseling' },
    { id: 'survey' }
  ];
}

export default function ResultsPage() {
  return <ResultsClient />;
}