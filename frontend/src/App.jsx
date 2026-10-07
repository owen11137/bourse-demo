import {useEffect,useRef,useState} from 'react';
import axios from 'axios';
import {Alert,AppBar,Box,Button,Card,CardContent,Chip,CircularProgress,Container,Divider,Grid,IconButton,LinearProgress,Paper,Stack,Toolbar,Typography} from '@mui/material';

const api=axios.create({baseURL:import.meta.env.VITE_API_URL || 'http://localhost:8080/api/v1',timeout:120000});
const number=(value,suffix='')=>value==null?'—':new Intl.NumberFormat('fa-IR',{maximumFractionDigits:2}).format(value)+suffix;
const errorText=e=>e.response?.data?.message || (e.code==='ERR_NETWORK'?'اتصال به سرور برقرار نشد. Backend را بررسی کنید.':e.message);

function Metric({label,value,unit}) {
  return <Card variant="outlined" sx={{height:'100%',borderRadius:3,bgcolor:'#fff'}}>
    <CardContent sx={{p:2.5}}><Typography color="text.secondary" variant="body2">{label}</Typography>
    <Typography variant="h5" fontWeight={800} sx={{mt:1,color:'#173b67'}}>{number(value)}</Typography>
    {unit&&<Typography variant="caption" color="text.secondary">{unit}</Typography>}</CardContent>
  </Card>;
}

export default function App(){
  const [file,setFile]=useState(null);
  const [preview,setPreview]=useState('');
  const [selected,setSelected]=useState(null);
  const [history,setHistory]=useState([]);
  const [loading,setLoading]=useState(false);
  const [historyLoading,setHistoryLoading]=useState(false);
  const [error,setError]=useState('');
  const [notice,setNotice]=useState('');
  const inputRef=useRef(null);

  async function loadHistory(){
    setHistoryLoading(true);
    try{const {data}=await api.get('/analyses');setHistory(Array.isArray(data)?data:[]);}
    catch(e){setError(errorText(e));}
    finally{setHistoryLoading(false);}
  }
  useEffect(()=>{
    let active=true;
    api.get('/analyses').then(({data})=>{if(active)setHistory(Array.isArray(data)?data:[]);})
      .catch(e=>{if(active)setError(errorText(e));});
    return ()=>{active=false;};
  },[]);
  useEffect(()=>{
    if(!file){setPreview('');return;}
    const url=URL.createObjectURL(file);
    setPreview(url);
    return ()=>URL.revokeObjectURL(url);
  },[file]);

  function chooseFile(candidate){
    setError('');setNotice('');
    if(!candidate)return;
    if(!['image/jpeg','image/png','image/webp','image/gif'].includes(candidate.type)){
      setError('فقط تصویر JPG، PNG، WebP یا GIF مجاز است.');return;
    }
    if(candidate.size>15*1024*1024){setError('حجم تصویر باید کمتر از ۱۵ مگابایت باشد.');return;}
    setFile(candidate);
  }
  async function analyze(){
    if(!file||loading)return;
    setLoading(true);setError('');setNotice('');
    try{
      const form=new FormData();form.append('image',file);
      const {data}=await api.post('/analyses',form);
      setSelected(data);setNotice('تحلیل با موفقیت ذخیره شد.');
      await loadHistory();
    }catch(e){setError(errorText(e));}
    finally{setLoading(false);}
  }
  async function remove(id){
    if(!window.confirm('این تحلیل از تاریخچه حذف شود؟'))return;
    try{await api.delete('/analyses/'+id);setHistory(items=>items.filter(x=>x.id!==id));if(selected?.id===id)setSelected(null);}
    catch(e){setError(errorText(e));}
  }
  const r=selected?.result;
  return <Box sx={{minHeight:'100vh',bgcolor:'#f4f7fb',pb:8}}>
    <AppBar position="static" elevation={0} sx={{bgcolor:'#102c4d'}}>
      <Toolbar sx={{gap:1.5}}>📊<Typography fontWeight={800} variant="h6">بورس دمو</Typography>
        <Box sx={{flexGrow:1}}/><Chip label="تحلیل هوشمند گزارش‌های مالی" sx={{color:'#eaf4ff',bgcolor:'#254d77'}}/></Toolbar>
    </AppBar>
    <Container maxWidth="lg" sx={{pt:{xs:3,md:5}}}>
      <Typography variant="h4" fontWeight={900} sx={{color:'#102c4d'}}>داشبورد تحلیل بنیادی</Typography>
      <Typography color="text.secondary" sx={{mt:1,mb:4}}>تصویر گزارش یا داشبورد مالی را بارگذاری کنید و اطلاعات استخراج‌شده را همراه با تاریخچه ببینید.</Typography>
      <Grid container spacing={3}>
        <Grid size={{xs:12,md:7}}>
          <Card sx={{borderRadius:4,boxShadow:'0 10px 35px #102c4d0c'}}>
            <CardContent sx={{p:{xs:2,md:3}}}>
              <Typography variant="h6" fontWeight={800} gutterBottom>بارگذاری تصویر</Typography>
              <Box onDragOver={e=>e.preventDefault()} onDrop={e=>{e.preventDefault();chooseFile(e.dataTransfer.files[0]);}}
                onClick={()=>inputRef.current?.click()}
                sx={{cursor:'pointer',border:'2px dashed #9db7d3',borderRadius:3,p:3,textAlign:'center',bgcolor:'#f8fbff',transition:'.2s','&:hover':{borderColor:'#1976d2'}}}>
                <input ref={inputRef} type="file" hidden accept="image/png,image/jpeg,image/webp,image/gif" onChange={e=>{chooseFile(e.target.files?.[0]);e.target.value='';}}/>
                {preview?<Box component="img" src={preview} alt="پیش‌نمایش تصویر انتخابی" sx={{maxWidth:'100%',maxHeight:300,objectFit:'contain',borderRadius:2}}/>:
                  <><Typography sx={{fontSize:48}}>☁️</Typography><Typography fontWeight={700}>برای انتخاب تصویر کلیک کنید یا فایل را اینجا رها کنید</Typography><Typography variant="body2" color="text.secondary" sx={{mt:1}}>PNG، JPG، WebP یا GIF — حداکثر ۱۵ مگابایت</Typography></>}
              </Box>
              {file&&<Typography variant="body2" sx={{mt:2}}>🖼️ {file.name}</Typography>}
              <Button fullWidth size="large" variant="contained" disabled={!file||loading} onClick={analyze} sx={{mt:3,py:1.4,borderRadius:2,fontWeight:800}}>
                {loading?<><CircularProgress size={20} color="inherit" sx={{ml:1}}/>در حال تحلیل تصویر...</>:'شروع تحلیل و ذخیره در پایگاه داده'}
              </Button>
              {loading&&<LinearProgress sx={{mt:2,borderRadius:2}}/>}
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{xs:12,md:5}}>
          <Card sx={{borderRadius:4,height:'100%',boxShadow:'0 10px 35px #102c4d0c'}}>
            <CardContent sx={{p:3}}>
              <Stack direction="row" alignItems="center" spacing={1}>🕘<Typography variant="h6" fontWeight={800}>تاریخچه تحلیل‌ها</Typography><Box sx={{flex:1}}/><IconButton aria-label="بروزرسانی تاریخچه" onClick={loadHistory} disabled={historyLoading}>↻</IconButton></Stack>
              <Divider sx={{my:2}}/>
              {historyLoading&&<LinearProgress/>}
              {!history.length?<Typography color="text.secondary" sx={{py:4,textAlign:'center'}}>هنوز تحلیلی ذخیره نشده است.</Typography>:
                <Stack spacing={1.2} sx={{maxHeight:350,overflowY:'auto'}}>
                  {history.map(item=><Paper key={item.id} variant="outlined" sx={{p:1.5,borderRadius:2,bgcolor:selected?.id===item.id?'#eaf3ff':'white'}}>
                    <Stack direction="row" alignItems="center" gap={1}>
                      <Box sx={{flex:1,cursor:'pointer'}} onClick={()=>{setSelected(item);setError('');}}>
                        <Typography fontWeight={700}>{item.result?.company?.name||'شرکت نامشخص'}</Typography>
                        <Typography variant="caption" color="text.secondary">{item.createdAt?new Date(item.createdAt).toLocaleString('fa-IR'):'—'} | شناسه {number(item.id)}</Typography>
                      </Box>
                      <IconButton size="small" color="error" aria-label="حذف تحلیل" onClick={()=>remove(item.id)}>×</IconButton>
                    </Stack>
                  </Paper>)}
                </Stack>}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      {error&&<Alert severity="error" onClose={()=>setError('')} sx={{mt:3}}>{error}</Alert>}
      {notice&&<Alert severity="success" onClose={()=>setNotice('')} sx={{mt:3}}>{notice}</Alert>}
      {r&&<Box sx={{mt:5}}>
        <Stack direction={{xs:'column',sm:'row'}} justifyContent="space-between" gap={1} sx={{mb:2}}>
          <Box><Typography variant="h5" fontWeight={900} color="#102c4d">{r.company?.name||'نتیجه تحلیل'}</Typography><Typography color="text.secondary">پایان سال مالی: {r.company?.fiscalYearEnd||'نامشخص'}</Typography></Box>
          <Chip color="primary" label={'تحلیل شماره '+number(selected.id)}/>
        </Stack>
        <Grid container spacing={2}>
          {[
            ['ارزش بازار',r.company?.marketValueBillionToman,'میلیارد تومان'],
            ['سود خالص برآوردی',r.estimates?.netProfit,'واحد مطابق تصویر'],
            ['سود عملیاتی برآوردی',r.estimates?.operatingProfit,'واحد مطابق تصویر'],
            ['حاشیه سود FIS',r.indicators?.fisProfitMarginPercent,'درصد'],
            ['نسبت مطالبات',r.indicators?.receivablesRatioPercent,'درصد'],
            ['میانگین تقسیم سود',r.indicators?.averageDividendPayoutPercent,'درصد'],
            ['فروش ماه جاری',r.revenue?.currentMonth,'واحد مطابق تصویر'],
            ['رشد سالانه فروش',r.revenue?.yearOverYearGrowthPercent,'درصد']
          ].map(([label,value,unit])=><Grid key={label} size={{xs:12,sm:6,md:3}}><Metric label={label} value={value} unit={unit}/></Grid>)}
        </Grid>
        <Grid container spacing={2} sx={{mt:1}}>
          <Grid size={{xs:12,md:6}}><Card sx={{borderRadius:3,height:'100%'}}><CardContent><Typography variant="h6" fontWeight={800}>جمع‌بندی تحلیل</Typography><Typography sx={{mt:2,lineHeight:2}}>{r.analysis?.summary||'توضیحی ثبت نشده است.'}</Typography></CardContent></Card></Grid>
          <Grid size={{xs:12,md:6}}><Card sx={{borderRadius:3,height:'100%'}}><CardContent>
            <Typography fontWeight={800} color="success.main">نکات مثبت</Typography><Stack spacing={1} sx={{my:1.5}}>{r.analysis?.positivePoints?.map((p,i)=><Typography key={i} variant="body2">• {p}</Typography>)}</Stack>
            <Divider sx={{my:2}}/><Typography fontWeight={800} color="warning.main">ریسک‌ها</Typography><Stack spacing={1} sx={{mt:1.5}}>{r.analysis?.riskPoints?.map((p,i)=><Typography key={i} variant="body2">• {p}</Typography>)}</Stack>
          </CardContent></Card></Grid>
        </Grid>
      </Box>}
    </Container>
  </Box>;
}
