import { useApp } from '../state/AppContext'
import Layout from '../components/Layout'
import Logo from '../components/Logo'

export default function About() {
  const { t } = useApp()
  const sections: [string, string][] = [
    [t('aboutImg'), t('aboutImgD')],
    [t('aboutAi'), t('aboutAiD')],
    [t('privacyTitle'), t('privacyD')],
  ]
  return (
    <Layout title={t('about')} back="/home">
      <div className="card flex items-center gap-4 p-4">
        <Logo size={56} />
        <div>
          <h2 className="font-display text-xl font-extrabold text-forest">{t('aboutTitle')}</h2>
          <p className="text-sm text-muted">{t('aboutTopic')}</p>
        </div>
      </div>
      <p className="mt-4 rounded-2xl bg-mint p-4 text-forest">{t('aboutFeatures')}</p>
      {sections.map(([h, d]) => (
        <section key={h} className="card mt-4 p-4">
          <h3 className="font-display text-lg font-bold text-forest">{h}</h3>
          <p className="mt-1 text-ink">{d}</p>
        </section>
      ))}
      <section className="card mt-4 p-4 text-sm">
        <table className="w-full">
          <tbody>
            {[
              [t('lblApp'), t('appName')],
              [t('lblCourse'), 'ET617'],
              [t('lblCard'), 'P1-T4-L1-C2'],
              [t('identity'), '24B3941'],
              [t('lblClass'), '6–7'],
              [t('langLabel'), t('lblLangs')],
            ].map(([k, v]) => (
              <tr key={k} className="border-b border-mint last:border-0">
                <td className="py-2 text-muted">{k}</td>
                <td className="py-2 text-right font-semibold text-forest">{v}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </Layout>
  )
}
