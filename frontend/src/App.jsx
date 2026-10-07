import {useEffect,useState} from 'react';
import axios from 'axios';
import {Alert,Box,Button,Card,CardContent,Chip,CircularProgress,Container,Grid,Stack,Typography} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';

const api=axios.create({baseURL:'http://localhost:8080/api/v1'});

function Metric({label,value}) {
  return <Card variant="outlined"><CardContent><Typography color="text.secondary">{label}</Typography><Typography variant="h5">{value ?? '—'}</Typography></CardContent></Card>;
}

export default function App(){
  const [file,setFile]=useState(null),[result,setResult]=useState(null),[history,setHistory]=useState([]),[loading,setLoading]=useState(false),[error,setError]=useState('');
  const load=()=>api.get('/analyses').then(r=>setHistory(r.data)).catch(()=>{});
  useEffect(load,[]);
  async function analyze(){
    if(!file)return;
    setLoading(true);setError('');
    try{const f=new FormData();f.append('image',file);const {data}=await api.post('/analyses',f);setResult(data);load();}
    catch(e){setError(e.response?.data?.message||e.message)}finally{setLoading(false)}
  }
  const r=result?.result;
  return <Container maxWidth="lg" sx={{py:5}}>
    <Typography variant="h3" fontWeight={800}>تحلیل تصویر بورسی</Typography>
    <Typography color="text.secondary" sx={{mt:1,mb:3}}>تصویر داشبورد مالی را ارسال کنید؛ نتیجه تحلیل می‌شود و در H2 ذخیره خواهد شد.</Typography>
    <Card><CardContent><Stack direction={{xs:'column',sm:'row'}} spacing={2} alignItems="center">
      <Button component="label" variant="outlined" startIcon={<CloudUploadIcon/>}>انتخاب تصویر<input hidden type="file" accept="image/*" onChange={e=>setFile(e.target.files?.[0])}/></Button>
      <Typography>{file?.name||'فایلی انتخاب نشده'}</Typography>
      <Button variant="contained" disabled={!file||loading} onClick={analyze}>{loading?<CircularProgress size={24}/>:'تحلیل و ذخیره'}</Button>
    </Stack></CardContent></Card>
    {error&&<Alert severity="error" sx={{mt:2}}>{error}</Alert>}
    {r&&<Box sx={{mt:4}}>
      <Typography variant="h4" gutterBottom>{r.company?.name||'نتیجه تحلیل'}</Typography>
      <Grid container spacing={2}>
        <Grid size={{xs:12,md:3}}><Metric label="ارزش بازار (میلیارد تومان)" value={r.company?.marketValueBillionToman}/></Grid>
        <Grid size={{xs:12,md:3}}><Metric label="برآورد سود خالص" value={r.estimates?.netProfit}/></Grid>
        <Grid size={{xs:12,md:3}}><Metric label="برآورد سود عملیاتی" value={r.estimates?.operatingProfit}/></Grid>
        <Grid size={{xs:12,md:3}}><Metric label="حاشیه سود FIS" value={r.indicators?.fisProfitMarginPercent==null?null:r.indicators.fisProfitMarginPercent+'٪'}/></Grid>
      </Grid>
      <Card sx={{mt:2}}><CardContent><Typography variant="h6">جمع‌بندی</Typography><Typography sx={{my:2}}>{r.analysis?.summary}</Typography>
        <Stack direction="row" gap={1} flexWrap="wrap">{r.analysis?.positivePoints?.map(x=><Chip key={x} label={x} color="success"/>)}{r.analysis?.riskPoints?.map(x=><Chip key={x} label={x} color="warning"/>)}</Stack>
      </CardContent></Card>
    </Box>}
    <Typography variant="h5" sx={{mt:5,mb:2}}>تاریخچه تحلیل‌ها</Typography>
    <Stack spacing={1}>{history.map(x=><Card key={x.id} variant="outlined"><CardContent><Typography fontWeight={700}>{x.result?.company?.name||'بدون نام'} — #{x.id}</Typography><Typography color="text.secondary">{new Date(x.createdAt).toLocaleString('fa-IR')}</Typography></CardContent></Card>)}</Stack>
  </Container>
}
